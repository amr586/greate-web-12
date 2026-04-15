import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { query } from '../db.js';
import { authenticate, AuthRequest, checkRateLimit, recordFailedAttempt, clearRateLimit, generateDeviceId, RATE_LIMIT_WINDOW, RATE_LIMIT_MAX_ATTEMPTS } from '../middleware/auth.js';
import { sendOTPEmail } from '../email.js';

const router = Router();

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error('FATAL: JWT_SECRET environment variable is required');
}

const OTP_EXPIRY_MS = 5 * 60 * 1000;
const OTP_RATE_LIMIT_S = 60;
const OTP_MAX_ATTEMPTS = 3;
const OTP_LOCKOUT_MS = 10 * 60 * 1000;
const DEVICE_TOKEN_EXPIRY_DAYS = 30;

async function ensureOTPTable() {
  await query(`
    CREATE TABLE IF NOT EXISTS otp_codes (
      id SERIAL PRIMARY KEY,
      identifier VARCHAR(200) NOT NULL,
      code VARCHAR(6) NOT NULL,
      type VARCHAR(20) NOT NULL CHECK (type IN ('register', 'login', 'forgot-password', 'email_verify')),
      user_data JSONB,
      device_id VARCHAR(64),
      attempts INTEGER DEFAULT 0,
      locked_until TIMESTAMPTZ,
      expires_at TIMESTAMPTZ NOT NULL,
      used BOOLEAN DEFAULT false,
      last_sent_at TIMESTAMPTZ DEFAULT NOW(),
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `);
  await query(`CREATE INDEX IF NOT EXISTS idx_otp_codes_identifier_type ON otp_codes(identifier, type)`);
  await query(`CREATE INDEX IF NOT EXISTS idx_otp_codes_device ON otp_codes(device_id) WHERE device_id IS NOT NULL`);
  await query(`CREATE INDEX IF NOT EXISTS idx_otp_codes_expires ON otp_codes(expires_at) WHERE expires_at IS NOT NULL`);

  await query(`
    CREATE TABLE IF NOT EXISTS trusted_devices (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      device_id VARCHAR(64) NOT NULL,
      device_name VARCHAR(200),
      last_used TIMESTAMPTZ DEFAULT NOW(),
      created_at TIMESTAMPTZ DEFAULT NOW(),
      UNIQUE(user_id, device_id)
    )
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS email_verification (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      is_verified BOOLEAN DEFAULT false,
      verified_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `);

  await query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT false`);
  await query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verified_at TIMESTAMPTZ`);
}

ensureOTPTable().catch(console.error);

setInterval(async () => {
  try {
    await query(`DELETE FROM otp_codes WHERE expires_at < NOW() OR (used = true AND created_at < NOW() - INTERVAL '24 hours')`);
  } catch (err) {
    console.error('[OTP Cleanup]', err);
  }
}, 60 * 60 * 1000);

function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

async function checkOTPRateLimit(identifier: string, type: string): Promise<{ allowed: boolean; waitSeconds: number }> {
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

async function issueOTP(identifier: string, type: string, userData?: object, deviceId?: string): Promise<string> {
  const otp = generateOTP();
  const expiresAt = new Date(Date.now() + OTP_EXPIRY_MS);
  
  await query(
    `INSERT INTO otp_codes (identifier, code, type, user_data, device_id, expires_at, last_sent_at)
     VALUES ($1, $2, $3, $4, $5, $6, NOW())
     ON CONFLICT (identifier, type) WHERE used = false DO UPDATE SET code = $2, expires_at = $6, last_sent_at = NOW(), user_data = $4, device_id = $5`,
    [identifier, otp, type, userData ? JSON.stringify(userData) : null, deviceId || null, expiresAt]
  );
  
  return otp;
}

async function consumeOTP(
  identifier: string,
  code: string,
  type: string
): Promise<{ valid: boolean; error?: string; userData?: any; deviceId?: string }> {
  const res = await query(
    `SELECT * FROM otp_codes
     WHERE identifier=$1 AND type=$2 AND used=false AND (expires_at > NOW() OR expires_at IS NULL)
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
    return { valid: false, error: 'انتهت صلاحية رمز التحقق. اضغط إعادة الإرسال' };
  }

  if (rec.code !== code.trim()) {
    const attempts = rec.attempts + 1;
    if (attempts >= OTP_MAX_ATTEMPTS) {
      const lockedUntil = new Date(Date.now() + OTP_LOCKOUT_MS);
      await query('UPDATE otp_codes SET attempts=$1, locked_until=$2 WHERE id=$3', [attempts, lockedUntil, rec.id]);
      return { valid: false, error: 'تجاوزت الحد الأقصى للمحاولات. محجوب لمدة 10 دقائق' };
    }
    const remaining = OTP_MAX_ATTEMPTS - attempts;
    await query('UPDATE otp_codes SET attempts=$1 WHERE id=$2', [attempts, rec.id]);
    return { valid: false, error: `رمز التحقق غير صحيح. ${remaining} محاولة متبقية` };
  }

  await query('UPDATE otp_codes SET used=true WHERE id=$1', [rec.id]);
  return { valid: true, userData: rec.user_data, deviceId: rec.device_id };
}

async function isTrustedDevice(userId: number, deviceId: string): Promise<boolean> {
  const res = await query(
    'SELECT id FROM trusted_devices WHERE user_id=$1 AND device_id=$2',
    [userId, deviceId]
  );
  return res.rows.length > 0;
}

async function addTrustedDevice(userId: number, deviceId: string, deviceName?: string) {
  await query(
    `INSERT INTO trusted_devices (user_id, device_id, device_name, last_used)
     VALUES ($1, $2, $3, NOW())
     ON CONFLICT (user_id, device_id) DO UPDATE SET last_used = NOW()`,
    [userId, deviceId, deviceName || null]
  );
}

async function getUserTrustedDevices(userId: number): Promise<{ device_id: string; device_name: string; last_used: Date }[]> {
  const res = await query(
    'SELECT device_id, device_name, last_used FROM trusted_devices WHERE user_id=$1 ORDER BY last_used DESC',
    [userId]
  );
  return res.rows;
}

async function removeTrustedDevice(userId: number, deviceId: string) {
  await query('DELETE FROM trusted_devices WHERE user_id=$1 AND device_id=$2', [userId, deviceId]);
}

router.post('/resend-login-otp', async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'البريد الإلكتروني مطلوب' });

    const rateCheck = await checkOTPRateLimit(email, 'login');
    if (!rateCheck.allowed) {
      return res.status(429).json({
        error: `يرجى الانتظار ${rateCheck.waitSeconds} ثان��ة قبل طلب رمز جديد`,
        waitSeconds: rateCheck.waitSeconds,
      });
    }

    const userRes = await query('SELECT id, name FROM users WHERE email=$1 AND is_active=true', [email]);
    if (userRes.rows.length === 0) {
      return res.status(404).json({ error: 'الحساب غير موجود' });
    }

    const otp = await issueOTP(email, 'login', { userId: userRes.rows[0].id });
    const sent = await sendOTPEmail(email, otp, userRes.rows[0].name, 'login');

    res.json({
      success: true,
      message: sent ? `تم إرسال رمز التحقق إلى ${email}` : `تم إنشاء رمز التحقق`,
      devOtp: sent ? undefined : otp,
    });
  } catch (err) {
    console.error('[resend-login-otp]', err);
    res.status(500).json({ error: 'خطأ داخلي في الخادم' });
  }
});

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

    const existing = await query('SELECT id FROM users WHERE email=$1 OR phone=$2', [email, phone]);
    if (existing.rows.length > 0) {
      return res.status(400).json({ error: 'البريد الإلكتروني أو رقم الهاتف مسجل مسبقاً' });
    }

    const rateCheck = await checkOTPRateLimit(email, 'register');
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
      `INSERT INTO users (name, email, phone, password_hash, role, email_verified)
       VALUES ($1, $2, $3, $4, 'user', false)
       RETURNING id, name, email, phone, role, sub_role, avatar_url, created_at`,
      [name, email, phone, passwordHash]
    );
    const user = insertRes.rows[0];

    await query(`INSERT INTO email_verification (user_id, is_verified) VALUES ($1, false)`, [user.id]);

    const token = jwt.sign(
      { id: user.id, role: user.role, sub_role: user.sub_role, email: user.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    try {
      const otpVerify = await issueOTP(email, 'email_verify', { userId: user.id });
      await sendOTPEmail(email, otpVerify, name, 'register');
    } catch (emailErr) {
      console.error('[verify-email-otp]', emailErr);
    }

    res.json({ 
      user, 
      token, 
      emailVerificationPending: true,
      message: 'تم إنشاء الحساب بنجاح. يرجى التحقق من بريدك الإلكتروني لتأكيده' 
    });
  } catch (err) {
    console.error('[verify-otp]', err);
    res.status(500).json({ error: 'خطأ داخلي في الخادم' });
  }
});

router.post('/send-email-verification', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user!;
    const userRes = await query('SELECT name, email FROM users WHERE id=$1', [user.id]);
    if (userRes.rows.length === 0) {
      return res.status(404).json({ error: 'المستخدم غير موجود' });
    }
    const { name, email } = userRes.rows[0];

    const rateCheck = await checkOTPRateLimit(email, 'email_verify');
    if (!rateCheck.allowed) {
      return res.status(429).json({
        error: `يرجى الانتظار ${rateCheck.waitSeconds} ثانية قبل طلب رمز جديد`,
        waitSeconds: rateCheck.waitSeconds,
      });
    }

    const existingVerified = await query('SELECT is_verified FROM email_verification WHERE user_id=$1', [user.id]);
    if (existingVerified.rows[0]?.is_verified) {
      return res.status(400).json({ error: 'البريد الإلكتروني مُVERIFY بالفعل' });
    }

    const otp = await issueOTP(email, 'email_verify', { userId: user.id });
    const sent = await sendOTPEmail(email, otp, name, 'register');

    res.json({
      success: true,
      message: sent ? `تم إرسال رابط التحقق إلى ${email}` : `تم إنشاء رمز التحقق`,
      devOtp: sent ? undefined : otp,
    });
  } catch (err) {
    console.error('[send-email-verification]', err);
    res.status(500).json({ error: 'خطأ داخلي في الخادم' });
  }
});

router.post('/verify-email', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { otp } = req.body;
    if (!otp) return res.status(400).json({ error: 'رمز التحقق مطلوب' });

    const user = req.user!;
    const userRes = await query('SELECT email FROM users WHERE id=$1', [user.id]);
    const email = userRes.rows[0]?.email;
    if (!email) return res.status(404).json({ error: 'البريد غير موجود' });

    const result = await consumeOTP(email, otp, 'email_verify');
    if (!result.valid) {
      return res.status(400).json({ error: result.error });
    }

    await query(
      `UPDATE users SET email_verified = true, email_verified_at = NOW() WHERE id=$1`,
      [user.id]
    );
    await query(`UPDATE email_verification SET is_verified = true, verified_at = NOW() WHERE user_id=$1`, [user.id]);

    res.json({ success: true, message: 'تم التحقق من البريد الإلكتروني بنجاح' });
  } catch (err) {
    console.error('[verify-email]', err);
    res.status(500).json({ error: 'خطأ داخلي في الخادم' });
  }
});

router.post('/login', async (req: Request, res: Response) => {
  try {
    const { emailOrPhone, password, deviceId: clientDeviceId } = req.body;
    if (!emailOrPhone || !password) {
      return res.status(400).json({ error: 'جميع الحقول مطلوبة' });
    }

    const ipKey = `login:${emailOrPhone}`;
    const rateLimit = checkRateLimit(ipKey, new Map(), RATE_LIMIT_MAX_ATTEMPTS, RATE_LIMIT_WINDOW);
    if (!rateLimit.allowed) {
      return res.status(429).json({
        error: `تجاوزت الحد الأقصى للمحاولات. حاول لاحقاً`,
        lockedUntil: rateLimit.lockedUntil,
      });
    }

    const result = await query(
      'SELECT * FROM users WHERE (email=$1 OR phone=$1) AND is_active=true',
      [emailOrPhone]
    );
    if (result.rows.length === 0) {
      recordFailedAttempt(ipKey, new Map(), RATE_LIMIT_MAX_ATTEMPTS, RATE_LIMIT_WINDOW);
      return res.status(401).json({ error: 'بيانات غير صحيحة' });
    }
    const user = result.rows[0];
    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      recordFailedAttempt(ipKey, new Map(), RATE_LIMIT_MAX_ATTEMPTS, RATE_LIMIT_WINDOW);
      return res.status(401).json({ error: 'بيانات غير صحيحة' });
    }

    clearRateLimit(ipKey);
    const deviceId = clientDeviceId || generateDeviceId(req);
    const isTrusted = await isTrustedDevice(user.id, deviceId);

    if (isTrusted) {
      const token = jwt.sign(
        { id: user.id, role: user.role, sub_role: user.sub_role, email: user.email, deviceId },
        JWT_SECRET,
        { expiresIn: '7d' }
      );
      await query('UPDATE trusted_devices SET last_used = NOW() WHERE user_id=$1 AND device_id=$2', [user.id, deviceId]);
      const { password_hash, ...safeUser } = user;
      return res.json({ user: safeUser, token, isTrustedDevice: true });
    }

    const rateCheck = await checkOTPRateLimit(user.email, 'login');
    if (!rateCheck.allowed) {
      return res.status(429).json({
        error: `يرجى الانتظار ${rateCheck.waitSeconds} ثانية قبل طلب رمز جديد`,
        waitSeconds: rateCheck.waitSeconds,
        requiresOTP: true,
        email: user.email,
      });
    }

    const otp = await issueOTP(user.email, 'login', { userId: user.id }, deviceId);
    const sent = await sendOTPEmail(user.email, otp, user.name, 'login');

    res.json({
      requiresOTP: true,
      email: user.email,
      message: sent ? `تم إرسال رمز التحقق إلى ${user.email}` : `تم إنشاء رمز التحقق`,
      devOtp: sent ? undefined : otp,
    });
  } catch (err) {
    console.error('[login]', err);
    res.status(500).json({ error: 'خطأ في تسجيل الدخول' });
  }
});

router.post('/verify-login-otp', async (req: Request, res: Response) => {
  try {
    const { email, otp, rememberDevice, deviceName } = req.body;
    if (!email || !otp) {
      return res.status(400).json({ error: 'البريد الإلكتروني ورمز التحقق مطلوبان' });
    }

    const result = await consumeOTP(email, otp, 'login');
    if (!result.valid) {
      return res.status(400).json({ error: result.error });
    }

    const userRes = await query('SELECT * FROM users WHERE email=$1 AND is_active=true', [email]);
    if (userRes.rows.length === 0) {
      return res.status(401).json({ error: 'الحساب غير موجود' });
    }
    const user = userRes.rows[0];
    const deviceId = result.deviceId || generateDeviceId(req);

    if (rememberDevice) {
      await addTrustedDevice(user.id, deviceId, deviceName);
    }

    const token = jwt.sign(
      { id: user.id, role: user.role, sub_role: user.sub_role, email: user.email, deviceId },
      JWT_SECRET,
      { expiresIn: DEVICE_TOKEN_EXPIRY_DAYS + 'd' }
    );
    const { password_hash, ...safeUser } = user;
    res.json({ user: safeUser, token, isTrustedDevice: !!rememberDevice });
  } catch (err) {
    console.error('[verify-login-otp]', err);
    res.status(500).json({ error: 'خطأ داخلي في الخادم' });
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
    const existing = await query('SELECT id FROM users WHERE email=$1 OR phone=$2', [email, phone]);
    if (existing.rows.length > 0) {
      return res.status(400).json({ error: 'البريد الإلكتروني أو رقم الهاتف مسجل مسبقاً' });
    }
    const passwordHash = await bcrypt.hash(password, 12);
    const insertRes = await query(
      `INSERT INTO users (name, email, phone, password_hash, role, email_verified)
       VALUES ($1, $2, $3, $4, 'user', false)
       RETURNING id, name, email, phone, role, sub_role, avatar_url, created_at`,
      [name, email, phone, passwordHash]
    );
    const user = insertRes.rows[0];
    await query(`INSERT INTO email_verification (user_id, is_verified) VALUES ($1, false)`, [user.id]);

    const token = jwt.sign(
      { id: user.id, role: user.role, sub_role: user.sub_role, email: user.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    setTimeout(async () => {
      try {
        const otpVerify = await issueOTP(email, 'email_verify', { userId: user.id });
        await sendOTPEmail(email, otpVerify, name, 'register');
      } catch (err) {
        console.error('[verify-email-otp]', err);
      }
    }, 2000);

    res.json({ 
      user, 
      token, 
      emailVerificationPending: true,
      message: 'تم إنشاء الحساب بنجاح. يرجى التحقق من بريدك الإلكتروني لتأكيده' 
    });
  } catch (err) {
    console.error('[register]', err);
    res.status(500).json({ error: 'خطأ داخلي في الخادم' });
  }
});

router.get('/trusted-devices', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const devices = await getUserTrustedDevices(req.user!.id);
    res.json(devices);
  } catch (err) {
    console.error('[trusted-devices]', err);
    res.status(500).json({ error: 'خطأ' });
  }
});

router.delete('/trusted-devices/:deviceId', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    await removeTrustedDevice(req.user!.id, req.params.deviceId);
    res.json({ success: true });
  } catch (err) {
    console.error('[remove-trusted-device]', err);
    res.status(500).json({ error: 'خطأ' });
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

router.post('/forgot-password', async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'البريد الإلكتروني مطلوب' });

    const userRes = await query('SELECT id, name FROM users WHERE email=$1 AND is_active=true', [email]);
    if (userRes.rows.length === 0) {
      return res.status(404).json({ error: 'لم يتم العثور على حساب بهذا البريد الإلكتروني' });
    }
    const user = userRes.rows[0];

    const rateCheck = await checkOTPRateLimit(email, 'forgot-password');
    if (!rateCheck.allowed) {
      return res.status(429).json({
        error: `يرجى الانتظار ${rateCheck.waitSeconds} ثانية قبل طلب رمز جديد`,
        waitSeconds: rateCheck.waitSeconds,
      });
    }

    const otp = await issueOTP(email, 'forgot-password', { userId: user.id });
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
    await query(`DELETE FROM trusted_devices WHERE user_id=(SELECT id FROM users WHERE email=$1)`, [email]);

    res.json({ success: true, message: 'تم تغيير كلمة المرور بنجاح' });
  } catch (err) {
    console.error('[reset-password]', err);
    res.status(500).json({ error: 'خطأ داخلي في الخادم' });
  }
});

router.get('/me', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const result = await query(
      'SELECT id, name, email, phone, role, sub_role, avatar_url, email_verified, email_verified_at, created_at FROM users WHERE id=$1',
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
       RETURNING id, name, email, phone, role, sub_role, avatar_url, email_verified, email_verified_at, created_at`,
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
    if (!/[A-Z]/.test(newPassword)) return res.status(400).json({ error: 'يجب أن تحتوي على حرف كبير' });
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(newPassword)) return res.status(400).json({ error: 'يجب أن تحتوي على رمز خاص' });
    
    const userRes = await query('SELECT password_hash FROM users WHERE id=$1', [req.user!.id]);
    if (userRes.rows.length === 0) return res.status(404).json({ error: 'المستخدم غير موجود' });
    
    const valid = await bcrypt.compare(currentPassword, userRes.rows[0].password_hash);
    if (!valid) return res.status(400).json({ error: 'كلمة المرور الحالية غير صحيحة' });
    
    const newHash = await bcrypt.hash(newPassword, 12);
    await query('UPDATE users SET password_hash=$1 WHERE id=$2', [newHash, req.user!.id]);
    await query(`DELETE FROM trusted_devices WHERE user_id=$1`, [req.user!.id]);
    
    res.json({ success: true, message: 'تم تغيير كلمة المرور. يرجى تسجيل الدخول مجدداً' });
  } catch {
    res.status(500).json({ error: 'خطأ في تغيير كلمة المرور' });
  }
});

export default router;