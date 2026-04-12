import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { query } from '../db.js';
import { authenticate, AuthRequest } from '../middleware/auth.js';
import { sendOTPEmail } from '../email.js';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'iskantek_secret_2024';
const OTP_EXPIRY_MS = 5 * 60 * 1000;
const OTP_RATE_LIMIT_S = 60;
const OTP_MAX_ATTEMPTS = 3;
const OTP_LOCKOUT_MS = 10 * 60 * 1000;

async function ensureOTPTable() {
  await query(`
    CREATE TABLE IF NOT EXISTS otp_codes (
      id SERIAL PRIMARY KEY,
      identifier VARCHAR(200) NOT NULL,
      code VARCHAR(6) NOT NULL,
      type VARCHAR(20) NOT NULL CHECK (type IN ('register', 'login', 'forgot-password')),
      user_data JSONB,
      attempts INTEGER DEFAULT 0,
      locked_until TIMESTAMPTZ,
      expires_at TIMESTAMPTZ NOT NULL,
      used BOOLEAN DEFAULT false,
      last_sent_at TIMESTAMPTZ DEFAULT NOW(),
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `);
}

ensureOTPTable().catch(console.error);

function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

async function checkRateLimit(identifier: string, type: string): Promise<{ allowed: boolean; waitSeconds: number }> {
  const res = await query(
    `SELECT last_sent_at FROM otp_codes
     WHERE identifier=$1 AND type=$2 AND used=false
     ORDER BY created_at DESC LIMIT 1`,
    [identifier, type]
  );
  if (res.rows.length === 0) return { allowed: true, waitSeconds: 0 };

  const lastSent = new Date(res.rows[0].last_sent_at).getTime();
  const elapsed = (Date.now() - lastSent) / 1000;
  if (elapsed < OTP_RATE_LIMIT_S) {
    return { allowed: false, waitSeconds: Math.ceil(OTP_RATE_LIMIT_S - elapsed) };
  }
  return { allowed: true, waitSeconds: 0 };
}

async function issueOTP(identifier: string, type: 'register' | 'login' | 'forgot-password', userData?: object): Promise<string> {
  await query(
    'DELETE FROM otp_codes WHERE identifier=$1 AND type=$2',
    [identifier, type]
  );
  const otp = generateOTP();
  const expiresAt = new Date(Date.now() + OTP_EXPIRY_MS);
  await query(
    `INSERT INTO otp_codes (identifier, code, type, user_data, expires_at, last_sent_at)
     VALUES ($1,$2,$3,$4,$5,NOW())`,
    [identifier, otp, type, userData ? JSON.stringify(userData) : null, expiresAt]
  );
  return otp;
}

async function consumeOTP(
  identifier: string,
  code: string,
  type: 'register' | 'login' | 'forgot-password'
): Promise<{ valid: boolean; error?: string; userData?: any }> {
  const res = await query(
    `SELECT * FROM otp_codes
     WHERE identifier=$1 AND type=$2 AND used=false
     ORDER BY created_at DESC LIMIT 1`,
    [identifier, type]
  );

  if (res.rows.length === 0) {
    return { valid: false, error: 'لم يتم طلب رمز تحقق لهذا الحساب، أعد الإرسال' };
  }

  const rec = res.rows[0];

  if (rec.locked_until && new Date(rec.locked_until) > new Date()) {
    const mins = Math.ceil((new Date(rec.locked_until).getTime() - Date.now()) / 60000);
    return { valid: false, error: `محجوب بسبب محاولات خاطئة متكررة. حاول بعد ${mins} دقيقة` };
  }

  if (new Date(rec.expires_at) < new Date()) {
    await query('DELETE FROM otp_codes WHERE id=$1', [rec.id]);
    return { valid: false, error: 'انتهت صلاحية رمز التحقق. اضغط إعادة الإرسال' };
  }

  if (rec.code !== code.trim()) {
    const attempts = rec.attempts + 1;
    if (attempts >= OTP_MAX_ATTEMPTS) {
      const lockedUntil = new Date(Date.now() + OTP_LOCKOUT_MS);
      await query(
        'UPDATE otp_codes SET attempts=$1, locked_until=$2 WHERE id=$3',
        [attempts, lockedUntil, rec.id]
      );
      return { valid: false, error: 'تجاوزت الحد الأقصى للمحاولات. محجوب لمدة 10 دقائق' };
    }
    const remaining = OTP_MAX_ATTEMPTS - attempts;
    await query('UPDATE otp_codes SET attempts=$1 WHERE id=$2', [attempts, rec.id]);
    return { valid: false, error: `رمز التحقق غير صحيح. ${remaining} محاولة متبقية` };
  }

  await query('UPDATE otp_codes SET used=true WHERE id=$1', [rec.id]);
  return { valid: true, userData: rec.user_data };
}

router.post('/send-otp', async (req: Request, res: Response) => {
  try {
    const { name, email, phone, password } = req.body;
    if (!name || !email || !phone || !password) {
      return res.status(400).json({ error: 'جميع الحقول مطلوبة' });
    }
    if (password.length < 8) {
      return res.status(400).json({ error: 'كلمة المرور يجب أن تكون 8 أحرف على الأقل' });
    }
    if (!/[A-Z]/.test(password)) {
      return res.status(400).json({ error: 'كلمة المرور يجب أن تحتوي على حرف كبير على الأقل' });
    }
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      return res.status(400).json({ error: 'كلمة المرور يجب أن تحتوي على رمز خاص على الأقل' });
    }

    const existing = await query(
      'SELECT id FROM users WHERE email=$1 OR phone=$2',
      [email, phone]
    );
    if (existing.rows.length > 0) {
      return res.status(400).json({ error: 'البريد الإلكتروني أو رقم الهاتف مسجل مسبقاً' });
    }

    const rateCheck = await checkRateLimit(email, 'register');
    if (!rateCheck.allowed) {
      return res.status(429).json({
        error: `يرجى الانتظار ${rateCheck.waitSeconds} ثانية قبل طلب رمز جديد`,
        waitSeconds: rateCheck.waitSeconds,
      });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const otp = await issueOTP(email, 'register', { name, email, phone, passwordHash });

    const sent = await sendOTPEmail(email, otp, name, 'register');
    if (!sent) {
      return res.status(503).json({ error: 'تعذّر إرسال البريد الإلكتروني. تحقق من الإعدادات أو حاول لاحقاً' });
    }

    res.json({ success: true, message: `تم إرسال رمز التحقق إلى ${email}` });
  } catch (err) {
    console.error('[send-otp]', err);
    res.status(500).json({ error: 'خطأ داخلي في الخادم' });
  }
});

router.post('/verify-otp', async (req: Request, res: Response) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      return res.status(400).json({ error: 'البريد الإلكتروني ورمز التحقق مطلوبان' });
    }

    const result = await consumeOTP(email, otp, 'register');
    if (!result.valid) {
      return res.status(400).json({ error: result.error });
    }

    const { name, phone, passwordHash } = result.userData as {
      name: string; email: string; phone: string; passwordHash: string;
    };

    const insertRes = await query(
      `INSERT INTO users (name, email, phone, password_hash, role)
       VALUES ($1,$2,$3,$4,'user')
       RETURNING id, name, email, phone, role, sub_role, avatar_url, created_at`,
      [name, email, phone, passwordHash]
    );
    const user = insertRes.rows[0];
    const token = jwt.sign(
      { id: user.id, role: user.role, sub_role: user.sub_role, email: user.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );
    res.json({ user, token });
  } catch (err) {
    console.error('[verify-otp]', err);
    res.status(500).json({ error: 'خطأ داخلي في الخادم' });
  }
});

router.post('/send-login-otp', async (req: Request, res: Response) => {
  try {
    const { emailOrPhone, password } = req.body;
    if (!emailOrPhone || !password) {
      return res.status(400).json({ error: 'جميع الحقول مطلوبة' });
    }

    const userRes = await query(
      'SELECT * FROM users WHERE (email=$1 OR phone=$1) AND is_active=true',
      [emailOrPhone]
    );
    if (userRes.rows.length === 0) {
      return res.status(401).json({ error: 'بيانات غير صحيحة' });
    }
    const user = userRes.rows[0];

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) return res.status(401).json({ error: 'بيانات غير صحيحة' });

    const rateCheck = await checkRateLimit(user.email, 'login');
    if (!rateCheck.allowed) {
      return res.status(429).json({
        error: `يرجى الانتظار ${rateCheck.waitSeconds} ثانية قبل طلب رمز جديد`,
        waitSeconds: rateCheck.waitSeconds,
      });
    }

    const otp = await issueOTP(user.email, 'login');
    const sent = await sendOTPEmail(user.email, otp, user.name, 'login');

    res.json({
      success: true,
      email: user.email,
      message: sent
        ? `تم إرسال رمز التحقق إلى ${user.email}`
        : `تم إنشاء رمز التحقق`,
      devOtp: sent ? undefined : otp,
    });
  } catch (err) {
    console.error('[send-login-otp]', err);
    res.status(500).json({ error: 'خطأ داخلي في الخادم' });
  }
});

router.post('/verify-login-otp', async (req: Request, res: Response) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      return res.status(400).json({ error: 'البريد الإلكتروني ورمز التحقق مطلوبان' });
    }

    const result = await consumeOTP(email, otp, 'login');
    if (!result.valid) {
      return res.status(400).json({ error: result.error });
    }

    const userRes = await query(
      'SELECT * FROM users WHERE email=$1 AND is_active=true',
      [email]
    );
    if (userRes.rows.length === 0) {
      return res.status(401).json({ error: 'الحساب غير موجود' });
    }
    const { password_hash, ...safeUser } = userRes.rows[0];
    const token = jwt.sign(
      { id: safeUser.id, role: safeUser.role, sub_role: safeUser.sub_role, email: safeUser.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );
    res.json({ user: safeUser, token });
  } catch (err) {
    console.error('[verify-login-otp]', err);
    res.status(500).json({ error: 'خطأ داخلي في الخادم' });
  }
});

router.post('/login', async (req: Request, res: Response) => {
  try {
    const { emailOrPhone, password } = req.body;
    if (!emailOrPhone || !password) {
      return res.status(400).json({ error: 'جميع الحقول مطلوبة' });
    }
    const result = await query(
      'SELECT * FROM users WHERE (email=$1 OR phone=$1) AND is_active=true',
      [emailOrPhone]
    );
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'بيانات غير صحيحة' });
    }
    const user = result.rows[0];
    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) return res.status(401).json({ error: 'بيانات غير صحيحة' });
    const token = jwt.sign(
      { id: user.id, role: user.role, sub_role: user.sub_role, email: user.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );
    const { password_hash, ...safeUser } = user;
    res.json({ user: safeUser, token });
  } catch (err) {
    res.status(500).json({ error: 'خطأ في تسجيل الدخول' });
  }
});

router.post('/register', async (req: Request, res: Response) => {
  try {
    const { name, email, phone, password } = req.body;
    if (!name || !email || !phone || !password) {
      return res.status(400).json({ error: 'جميع الحقول مطلوبة' });
    }
    if (password.length < 8) {
      return res.status(400).json({ error: 'كلمة المرور يجب أن تكون 8 أحرف على الأقل' });
    }
    if (!/[A-Z]/.test(password)) {
      return res.status(400).json({ error: 'كلمة المرور يجب أن تحتوي على حرف كبير على الأقل' });
    }
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?0-9]/.test(password)) {
      return res.status(400).json({ error: 'كلمة المرور يجب أن تحتوي على رمز خاص أو رقم على الأقل' });
    }
    const existing = await query(
      'SELECT id FROM users WHERE email=$1 OR phone=$2',
      [email, phone]
    );
    if (existing.rows.length > 0) {
      return res.status(400).json({ error: 'البريد الإلكتروني أو رقم الهاتف مسجل مسبقاً' });
    }
    const passwordHash = await bcrypt.hash(password, 12);
    const insertRes = await query(
      `INSERT INTO users (name, email, phone, password_hash, role)
       VALUES ($1,$2,$3,$4,'user')
       RETURNING id, name, email, phone, role, sub_role, avatar_url, created_at`,
      [name, email, phone, passwordHash]
    );
    const user = insertRes.rows[0];
    const token = jwt.sign(
      { id: user.id, role: user.role, sub_role: user.sub_role, email: user.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );
    // Notify all admins and support staff of new registration
    try {
      const adminsRes = await query("SELECT id FROM users WHERE role IN ('admin','superadmin') AND is_active=true");
      for (const admin of adminsRes.rows) {
        await query(
          `INSERT INTO notifications (user_id, type, title, message, user_data)
           VALUES ($1,'new_registration','مستخدم جديد سجّل',$2,$3)`,
          [
            admin.id,
            `مستخدم جديد: ${name} - ${phone} (${email})`,
            JSON.stringify({ name, email, phone }),
          ]
        );
      }
    } catch (notifyErr) {
      console.error('[register notify]', notifyErr);
    }
    res.json({ user, token });
  } catch (err) {
    console.error('[register]', err);
    res.status(500).json({ error: 'خطأ داخلي في الخادم' });
  }
});

router.post('/forgot-password-check', async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'البريد الإلكتروني مطلوب' });
    const userRes = await query('SELECT id FROM users WHERE email=$1 AND is_active=true', [email]);
    if (userRes.rows.length === 0) {
      return res.status(404).json({ error: 'لم يتم العثور على حساب بهذا البريد الإلكتروني' });
    }
    res.json({ success: true });
  } catch (err) {
    console.error('[forgot-password-check]', err);
    res.status(500).json({ error: 'خطأ داخلي في الخادم' });
  }
});

router.post('/reset-password-direct', async (req: Request, res: Response) => {
  try {
    const { email, newPassword } = req.body;
    if (!email || !newPassword) return res.status(400).json({ error: 'جميع الحقول مطلوبة' });
    if (newPassword.length < 8) return res.status(400).json({ error: 'كلمة المرور يجب أن تكون 8 أحرف على الأقل' });
    if (!/[A-Z]/.test(newPassword)) return res.status(400).json({ error: 'كلمة المرور يجب أن تحتوي على حرف كبير على الأقل' });
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(newPassword)) return res.status(400).json({ error: 'كلمة المرور يجب أن تحتوي على رمز خاص على الأقل' });
    const userRes = await query('SELECT id FROM users WHERE email=$1 AND is_active=true', [email]);
    if (userRes.rows.length === 0) {
      return res.status(404).json({ error: 'لم يتم العثور على حساب بهذا البريد الإلكتروني' });
    }
    const newHash = await bcrypt.hash(newPassword, 12);
    await query('UPDATE users SET password_hash=$1 WHERE email=$2', [newHash, email]);
    res.json({ success: true, message: 'تم تغيير كلمة المرور بنجاح' });
  } catch (err) {
    console.error('[reset-password-direct]', err);
    res.status(500).json({ error: 'خطأ داخلي في الخادم' });
  }
});

router.get('/me', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const result = await query(
      'SELECT id, name, email, phone, role, sub_role, avatar_url, created_at FROM users WHERE id=$1',
      [req.user!.id]
    );
    res.json(result.rows[0]);
  } catch {
    res.status(500).json({ error: 'خطأ' });
  }
});

router.put('/profile', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { name, phone, avatar_url } = req.body;
    if (!name || !phone) return res.status(400).json({ error: 'الاسم ورقم الهاتف مطلوبان' });
    const result = await query(
      `UPDATE users SET name=$1, phone=$2, avatar_url=$3 WHERE id=$4
       RETURNING id, name, email, phone, role, sub_role, avatar_url, created_at`,
      [name.trim(), phone.trim(), avatar_url || null, req.user!.id]
    );
    res.json(result.rows[0]);
  } catch {
    res.status(500).json({ error: 'خطأ في تحديث البيانات' });
  }
});

router.put('/change-password', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) return res.status(400).json({ error: 'جميع الحقول مطلوبة' });
    if (newPassword.length < 8) return res.status(400).json({ error: 'كلمة المرور الجديدة يجب أن تكون 8 أحرف على الأقل' });
    const userRes = await query('SELECT password_hash FROM users WHERE id=$1', [req.user!.id]);
    if (userRes.rows.length === 0) return res.status(404).json({ error: 'المستخدم غير موجود' });
    const valid = await bcrypt.compare(currentPassword, userRes.rows[0].password_hash);
    if (!valid) return res.status(400).json({ error: 'كلمة المرور الحالية غير صحيحة' });
    const newHash = await bcrypt.hash(newPassword, 12);
    await query('UPDATE users SET password_hash=$1 WHERE id=$2', [newHash, req.user!.id]);
    res.json({ success: true });
  } catch {
    res.status(500).json({ error: 'خطأ في تغيير كلمة المرور' });
  }
});

router.post('/forgot-password', async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'البريد الإلكتروني مطلوب' });

    const userRes = await query('SELECT id, name FROM users WHERE email=$1 AND is_active=true', [email]);
    if (userRes.rows.length === 0) {
      return res.status(404).json({ error: 'لم يتم العثور على حساب بهذا البريد الإلكتروني' });
    }
    const user = userRes.rows[0];

    const rateCheck = await checkRateLimit(email, 'forgot-password');
    if (!rateCheck.allowed) {
      return res.status(429).json({
        error: `يرجى الانتظار ${rateCheck.waitSeconds} ثانية قبل طلب رمز جديد`,
        waitSeconds: rateCheck.waitSeconds,
      });
    }

    const otp = await issueOTP(email, 'forgot-password');
    const sent = await sendOTPEmail(email, otp, user.name, 'forgot-password');

    res.json({
      success: true,
      message: sent ? `تم إرسال رمز التحقق إلى ${email}` : `تم إنشاء رمز التحقق`,
      devOtp: sent ? undefined : otp,
    });
  } catch (err) {
    console.error('[forgot-password]', err);
    res.status(500).json({ error: 'خطأ داخلي في الخادم' });
  }
});

router.post('/verify-forgot-password', async (req: Request, res: Response) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) return res.status(400).json({ error: 'البريد الإلكتروني ورمز التحقق مطلوبان' });

    const result = await consumeOTP(email, otp, 'forgot-password');
    if (!result.valid) return res.status(400).json({ error: result.error });

    res.json({ success: true });
  } catch (err) {
    console.error('[verify-forgot-password]', err);
    res.status(500).json({ error: 'خطأ داخلي في الخادم' });
  }
});

router.post('/reset-password', async (req: Request, res: Response) => {
  try {
    const { email, otp, newPassword } = req.body;
    if (!email || !otp || !newPassword) return res.status(400).json({ error: 'جميع الحقول مطلوبة' });
    if (newPassword.length < 8) return res.status(400).json({ error: 'كلمة المرور يجب أن تكون 8 أحرف على الأقل' });
    if (!/[A-Z]/.test(newPassword)) return res.status(400).json({ error: 'كلمة المرور يجب أن تحتوي على حرف كبير على الأقل' });
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(newPassword)) return res.status(400).json({ error: 'كلمة المرور يجب أن تحتوي على رمز خاص على الأقل' });

    const result = await consumeOTP(email, otp, 'forgot-password');
    if (!result.valid) return res.status(400).json({ error: result.error });

    const newHash = await bcrypt.hash(newPassword, 12);
    await query('UPDATE users SET password_hash=$1 WHERE email=$2', [newHash, email]);

    res.json({ success: true, message: 'تم تغيير كلمة المرور بنجاح' });
  } catch (err) {
    console.error('[reset-password]', err);
    res.status(500).json({ error: 'خطأ داخلي في الخادم' });
  }
});

export default router;
