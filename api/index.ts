import mysql from 'mysql2/promise';

const JWT_SECRET = process.env.JWT_SECRET || (() => { throw new Error('JWT_SECRET not configured'); })();

async function runMigrations(pool: any) {
  const migrations = [
    `CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(200) NOT NULL,
      email VARCHAR(200) UNIQUE NOT NULL,
      phone VARCHAR(30),
      password_hash TEXT NOT NULL,
      role VARCHAR(20) DEFAULT 'user',
      sub_role VARCHAR(30),
      avatar_url TEXT,
      is_active BOOLEAN DEFAULT true,
      email_verified BOOLEAN DEFAULT false,
      email_verified_at TIMESTAMP NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS properties (
      id INT AUTO_INCREMENT PRIMARY KEY,
      title VARCHAR(300),
      title_ar VARCHAR(300),
      description TEXT,
      description_ar TEXT,
      type VARCHAR(50),
      purpose VARCHAR(20) DEFAULT 'sale',
      price NUMERIC,
      area NUMERIC,
      rooms INT,
      bedrooms INT,
      bathrooms INT,
      floor INT,
      address TEXT,
      district VARCHAR(100),
      city VARCHAR(100),
      contact_phone VARCHAR(20) DEFAULT '01100111618',
      owner_id INT,
      status VARCHAR(20) DEFAULT 'pending',
      is_featured BOOLEAN DEFAULT false,
      views INT DEFAULT 0,
      has_parking BOOLEAN DEFAULT false,
      has_elevator BOOLEAN DEFAULT false,
      has_garden BOOLEAN DEFAULT false,
      has_pool BOOLEAN DEFAULT false,
      has_basement BOOLEAN DEFAULT false,
      is_furnished BOOLEAN DEFAULT false,
      down_payment VARCHAR(100),
      delivery_status VARCHAR(100),
      finishing_type VARCHAR(50),
      floor_plan_image TEXT,
      google_maps_url TEXT,
      approved_by INT,
      approved_at TIMESTAMP NULL,
      sold_to INT,
      sold_at TIMESTAMP NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS property_images (
      id INT AUTO_INCREMENT PRIMARY KEY,
      property_id INT,
      url TEXT NOT NULL,
      is_primary BOOLEAN DEFAULT false,
      order_index INT DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS saved_properties (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT,
      property_id INT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE KEY unique_save (user_id, property_id)
    )`,
    `CREATE TABLE IF NOT EXISTS notifications (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT,
      type VARCHAR(50),
      title VARCHAR(300),
      message TEXT,
      property_data JSON,
      user_data JSON,
      link TEXT,
      is_read BOOLEAN DEFAULT false,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS payment_requests (
      id INT AUTO_INCREMENT PRIMARY KEY,
      property_id INT,
      buyer_id INT,
      amount NUMERIC,
      payment_method VARCHAR(50),
      notes TEXT,
      screenshot_url TEXT,
      contact_phone VARCHAR(20),
      status VARCHAR(20) DEFAULT 'pending',
      processed_by INT,
      processed_at TIMESTAMP NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS contact_messages (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(200) NOT NULL,
      email VARCHAR(200) NOT NULL,
      phone VARCHAR(30),
      subject VARCHAR(300) NOT NULL,
      message TEXT NOT NULL,
      ip_address VARCHAR(50),
      is_read BOOLEAN DEFAULT false,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS support_tickets (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT,
      subject TEXT,
      status VARCHAR(20) DEFAULT 'open',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS support_messages (
      id INT AUTO_INCREMENT PRIMARY KEY,
      ticket_id INT,
      sender_id INT,
      content TEXT,
      is_admin BOOLEAN DEFAULT false,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS property_chat_messages (
      id INT AUTO_INCREMENT PRIMARY KEY,
      property_id INT,
      sender_id INT,
      content TEXT,
      is_admin BOOLEAN DEFAULT false,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS otp_codes (
      id INT AUTO_INCREMENT PRIMARY KEY,
      identifier VARCHAR(200) NOT NULL,
      code VARCHAR(6) NOT NULL,
      type VARCHAR(20) NOT NULL,
      user_data JSON,
      attempts INT DEFAULT 0,
      locked_until TIMESTAMP NULL,
      expires_at TIMESTAMP NOT NULL,
      used BOOLEAN DEFAULT false,
      last_sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS trusted_devices (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT,
      device_id VARCHAR(64) NOT NULL,
      device_name VARCHAR(200),
      last_used TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE KEY unique_device (user_id, device_id)
    )`,
    `CREATE TABLE IF NOT EXISTS email_verification (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT,
      is_verified BOOLEAN DEFAULT false,
      verified_at TIMESTAMP NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,
  ];

  for (const sql of migrations) {
    try {
      await pool.query(sql);
      console.log('[MIGRATION] Executed successfully');
    } catch (e: any) {
      console.log('[MIGRATION] Skipped or error:', e.message);
    }
  }

  // Seed default accounts
  const seedAccounts = [
    { name: 'Super Admin', email: 'admin@greatsociety.com', phone: '01100111618', password: 'Admin@GreatSociety1', role: 'superadmin', sub_role: null },
    { name: 'مدخل بيانات', email: 'dataentry@greatsociety.com', phone: '01100111619', password: 'DataEntry@123', role: 'admin', sub_role: 'data_entry' },
    { name: 'مدير عقارات', email: 'propmanager@greatsociety.com', phone: '01100111620', password: 'PropMgr@123', role: 'admin', sub_role: 'property_manager' },
    { name: 'دعم فني', email: 'support@greatsociety.com', phone: '01100111621', password: 'Support@123', role: 'admin', sub_role: 'support' },
  ];

  for (const acc of seedAccounts) {
    try {
      const bcrypt = await import('bcryptjs');
      const hash = await bcrypt.hash(acc.password, 10);
      await pool.query(
        `INSERT IGNORE INTO users (name, email, phone, password_hash, role, sub_role) VALUES (?, ?, ?, ?, ?, ?)`,
        [acc.name, acc.email, acc.phone, hash, acc.role, acc.sub_role]
      );
      console.log('[SEED] Account created:', acc.email);
    } catch (e: any) {
      console.log('[SEED] Skipped:', e.message);
    }
  }
}

function generateDeviceId(req: any): string {
  const deviceId = req.headers['x-device-id'] || crypto.randomUUID();
  return deviceId.slice(0, 64);
}

function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// ========== EMAIL (SMTP) ==========

const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASS = process.env.SMTP_PASS;
const SKIP_EMAIL = process.env.SKIP_EMAIL === 'true';

console.log('[DEBUG] SMTP configured:', !!SMTP_USER, 'PASS set:', !!SMTP_PASS);

async function sendOTPEmail(to: string, otp: string, name: string, context: 'login' | 'register' | 'forgot-password' = 'register'): Promise<boolean> {
  // Skip email if SKIP_EMAIL=true (for testing without SMTP)
  if (SKIP_EMAIL) {
    console.log(`[EMAIL] Skipped - SKIP_EMAIL=true, OTP: ${otp}`);
    return false;
  }
  
  if (!SMTP_USER || !SMTP_PASS) {
    console.log('[EMAIL] SMTP not configured, skipping email');
    return false;
  }
  
  const nodemailer = await import('nodemailer');
  
  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: { user: SMTP_USER, pass: SMTP_PASS },
    tls: { minVersion: 'TLSv1.2' },
    connectionTimeout: 10000,
    socketTimeout: 10000
  });
  
  // Verify connection on startup
  try {
    await transporter.verify();
    console.log('[EMAIL] SMTP connection verified');
  } catch (e) {
    console.log('[EMAIL] SMTP verification failed:', e);
  }

  const actionLabel = context === 'login' ? 'تسجيل الدخول إلى حسابك' : context === 'forgot-password' ? 'استعادة كلمة المرور' : 'تأكيد إنشاء حسابك';
  const subject = context === 'login' ? 'رمز تسجيل الدخول — Great Society' : context === 'forgot-password' ? 'رمز استعادة كلمة المرور — Great Society' : 'رمز التحقق لإنشاء حسابك — Great Society';

  const html = `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head><meta charset="UTF-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0" /></head>
<body style="margin:0;padding:0;background:#f0f4f8;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f0f4f8;padding:40px 16px;">
    <tr><td align="center">
      <table width="100%" style="max-width:480px;background:#ffffff;border-radius:20px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
        <tr>
          <td style="background:linear-gradient(135deg,#005a7d,#007a9a);padding:36px 32px;text-align:center;">
            <p style="margin:0 0 4px;color:#bca056;font-size:12px;letter-spacing:3px;text-transform:uppercase;font-weight:700;">GREAT SOCIETY</p>
            <h1 style="margin:0;color:#ffffff;font-size:22px;font-weight:900;">منصة إسكنك العقارية</h1>
            <p style="margin:8px 0 0;color:rgba(255,255,255,0.7);font-size:14px;">Alexandria, Egypt</p>
          </td>
        </tr>
        <tr>
          <td style="padding:36px 32px;text-align:center;">
            <p style="margin:0 0 8px;color:#374151;font-size:16px;">مرحباً <strong style="color:#005a7d;">${name}</strong></p>
            <p style="margin:0 0 28px;color:#6b7280;font-size:14px;line-height:1.6;">
              طلبت <strong>${actionLabel}</strong>.<br/>
              استخدم الرمز التالي لإتمام العملية:
            </p>
            <div style="display:inline-block;background:linear-gradient(135deg,#005a7d,#007a9a);border-radius:16px;padding:24px 40px;margin-bottom:28px;">
              <span style="color:#ffffff;font-size:40px;font-weight:900;letter-spacing:14px;display:block;">${otp}</span>
            </div>
            <table width="100%" style="background:#fef3cd;border:1px solid #fde68a;border-radius:12px;margin-bottom:24px;">
              <tr><td style="padding:14px 16px;text-align:center;">
                <p style="margin:0;color:#92400e;font-size:13px;">⏱️ هذا الرمز صالح لمدة <strong>5 دقائق فقط</strong></p>
                <p style="margin:6px 0 0;color:#92400e;font-size:12px;">🔒 لديك 3 محاولات قبل الحجب المؤقت</p>
              </td></tr>
            </table>
            <p style="margin:0;color:#9ca3af;font-size:12px;line-height:1.7;">إذا لم تطلب هذا الرمز، تجاهل هذا البريد فوراً.<br/>لا تشارك هذا الرمز مع أي شخص.</p>
          </td>
        </tr>
        <tr>
          <td style="background:#f9fafb;padding:20px 32px;text-align:center;border-top:1px solid #e5e7eb;">
            <p style="margin:0;color:#9ca3af;font-size:11px;">&copy; 2026 Great Society Real Estate · الإسكندرية، مصر</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

  try {
    await transporter.sendMail({
      from: `"Great Society إسكنك" <${SMTP_USER}>`,
      to,
      subject,
      html,
    });
    console.log(`[EMAIL] ✅ Sent to ${to}`);
    return true;
  } catch (err: any) {
    console.error('[EMAIL] ❌ Failed:', err?.message || err);
    return false;
  }
}

// ========== SECURITY HELPERS ==========

// Rate limiting storage
const rateLimitStore = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX = 10; // 10 requests per minute per identifier

function checkRateLimit(identifier: string): { allowed: boolean; remaining: number; resetAt: number } {
  const now = Date.now();
  const record = rateLimitStore.get(identifier);
  
  if (!record || now > record.resetAt) {
    rateLimitStore.set(identifier, { count: 1, resetAt: now + RATE_LIMIT_WINDOW });
    return { allowed: true, remaining: RATE_LIMIT_MAX - 1, resetAt: now + RATE_LIMIT_WINDOW };
  }
  
  if (record.count >= RATE_LIMIT_MAX) {
    return { allowed: false, remaining: 0, resetAt: record.resetAt };
  }
  
  record.count++;
  return { allowed: true, remaining: RATE_LIMIT_MAX - record.count, resetAt: record.resetAt };
}

function clearRateLimit(identifier: string) {
  rateLimitStore.delete(identifier);
}

// Input sanitization
function sanitizeString(str: string | undefined, maxLength = 300): string {
  if (!str) return '';
  return str.trim().slice(0, maxLength).replace(/[<>'";&]/g, '');
}

function sanitizeEmail(email: string | undefined): string {
  if (!email) return '';
  return email.toLowerCase().trim().slice(0, 200).replace(/[^a-z0-9@._-]/g, '');
}

function sanitizePhone(phone: string | undefined): string {
  if (!phone) return '';
  return phone.replace(/[^0-9+]/g, '').slice(0, 20);
}

function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validatePassword(password: string): { valid: boolean; error?: string } {
  if (password.length < 8) return { valid: false, error: 'كلمة المرور 8 أحرف minimum' };
  if (!/[A-Z]/.test(password)) return { valid: false, error: 'حرف كبير مطلوب' };
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) return { valid: false, error: 'رمز خاص مطلوب' };
  return { valid: true };
}

function validateId(idStr: string | undefined): number | null {
  if (!idStr) return null;
  const id = parseInt(idStr, 10);
  return (isNaN(id) || id <= 0 || id > 2147483647) ? null : id;
}

function validateNumeric(value: any, max: number = 999999999): number | null {
  if (value === undefined || value === null || value === '') return null;
  const num = parseFloat(value);
  return (isNaN(num) || num < 0 || num > max) ? null : num;
}

function validateBoolean(value: any): boolean {
  return value === true || value === 'true' || value === 1 || value === '1';
}

function validateEnum(value: string | undefined, allowed: string[]): string | null {
  if (!value) return null;
  return allowed.includes(value) ? value : null;
}

function verifyToken(token: string): any {
  try {
    const jwt = require('jsonwebtoken');
    return jwt.verify(token, JWT_SECRET);
  } catch {
    return null;
  }
}

function generateToken(payload: any): string {
  return require('jsonwebtoken').sign(payload, JWT_SECRET, { expiresIn: '24h' });
}

async function consumeOTP(identifier: string, code: string, type: string, pool: any) {
  const [rows]: any = await pool.query(
    `SELECT * FROM otp_codes 
     WHERE identifier=? AND type=? AND used=false AND expires_at > NOW()
     ORDER BY created_at DESC LIMIT 1`,
    [identifier, type]
  );

  if (rows.length === 0) {
    return { valid: false, error: 'لم يتم طلب رمز تحقق لهذا الحساب، أعد الإرسال' };
  }

  const rec = rows[0];

  if (rec.locked_until && new Date(rec.locked_until) > new Date()) {
    const mins = Math.ceil((new Date(rec.locked_until).getTime() - Date.now()) / 60000);
    return { valid: false, error: `محجوب بسبب محاولات خاطئة متكررة. حاول بعد ${mins} دقيقة` };
  }

  if (new Date(rec.expires_at) < new Date()) {
    return { valid: false, error: 'انتهت صلاحية رمز التحقق. اضغط إعادة الإرسال' };
  }

  if (rec.code !== code.trim()) {
    const attempts = rec.attempts + 1;
    if (attempts >= 3) {
      const lockedUntil = new Date(Date.now() + 10 * 60 * 1000);
      await pool.query('UPDATE otp_codes SET attempts=?, locked_until=? WHERE id=?', [attempts, lockedUntil, rec.id]);
      return { valid: false, error: 'تجاوزت الحد الأقصى للمحاولات. محجوب لمدة 10 دقائق' };
    }
    await pool.query('UPDATE otp_codes SET attempts=? WHERE id=?', [attempts, rec.id]);
    return { valid: false, error: `رمز التحقق غير صحيح. ${3 - attempts} محاولة متبقية` };
  }

  await pool.query('UPDATE otp_codes SET used=true WHERE id=?', [rec.id]);
  return { valid: true, userData: rec.user_data, deviceId: rec.device_id };
}

// Allowed origins from env (comma-separated)
const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS || 'https://greatsociety-eg.com,https://greate-web-12.vercel.app').split(',');

export default async function handler(req: any, res: any) {
  try {
    // CORS - must be first, before any other processing
    const origin = req.headers.origin;
    const allowedOrigin = ALLOWED_ORIGINS.includes(origin) ? origin : (ALLOWED_ORIGINS[0] || '*');
    
    // Handle preflight OPTIONS immediately
    if (req.method === 'OPTIONS') {
      res.setHeader('Access-Control-Allow-Origin', allowedOrigin);
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, PUT, DELETE, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
      res.setHeader('Access-Control-Max-Age', '86400');
      res.setHeader('Access-Control-Allow-Credentials', 'true');
      res.setHeader('Vary', 'Origin');
      return res.status(204).end();
    }
    
    // Security headers
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    res.setHeader('Content-Security-Policy', "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self' https://greatsociety-eg.com https://greate-web-12.vercel.app");
    
    // CORS for actual requests
    res.setHeader('Access-Control-Allow-Origin', allowedOrigin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');

    const { query: urlQuery, method, url, headers, body } = req;
    
    // Strip query string for route matching
    const cleanUrl = url?.split('?')[0] || url;
    
  const authHeader = headers.authorization;
  const token = authHeader?.replace(/^Bearer\s+/i, '');
  const user = token ? verifyToken(token) : null;

  const dbConfig = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: parseInt(process.env.DB_PORT || '3306'),
    waitForConnections: true,
    connectionLimit: 2,
    queueLimit: 0
  };

  if (!dbConfig.host || !dbConfig.user || !dbConfig.password || !dbConfig.database) {
    return res.status(500).json({ ok: false, error: 'Database configuration missing' });
  }

  let pool;
  try {
    pool = mysql.createPool(dbConfig);
  } catch (e: any) {
    return res.status(500).json({ ok: false, error: 'Pool creation failed: ' + e.message });
  }

  // Run migrations on every request (lightweight check)
  await runMigrations(pool);

  // ========== AUTH ENDPOINTS ==========

  // POST /api/auth/login (exact match)
  if (method === 'POST' && cleanUrl === '/api/auth/login') {
    try {
      const { emailOrPhone, password, deviceId } = body;
      if (!emailOrPhone || !password) {
        return res.status(400).json({ error: 'جميع الحقول مطلوبة' });
      }

      const clientIP = headers['x-forwarded-for']?.split(',')[0]?.trim() || 'unknown';
      const clientDeviceId = deviceId || Buffer.from(clientIP + (headers['user-agent'] || 'unknown')).toString('base64').slice(0, 64);
      
      const emailKey = `login:${emailOrPhone}`;
      const ipKey = `ip:${clientIP}`;
      const emailRateLimit = checkRateLimit(emailKey);
      const ipRateLimit = checkRateLimit(ipKey);
      
      if (!emailRateLimit.allowed || !ipRateLimit.allowed) {
        return res.status(429).json({ error: 'تجاوزت الحد الأقصى للمحاولات. حاول لاحقاً' });
      }

      const cleanEmail = emailOrPhone.trim().toLowerCase();
      const [rows] = await pool.query(
        'SELECT * FROM users WHERE (LOWER(email)=? OR phone=?) AND is_active != 0',
        [cleanEmail, emailOrPhone]
      );
      
      if (!rows || rows.length === 0) {
        // Record failed attempt
        checkRateLimit(emailKey); // increment
        checkRateLimit(ipKey);
        return res.status(401).json({ error: 'بيانات غير صحيحة' });
      }
      
      const userData = rows[0];
      
      const bcrypt = await import('bcryptjs');
      const valid = await bcrypt.compare(password, userData.password_hash);
      
      if (!valid) {
        // Record failed attempt
        checkRateLimit(emailKey); // increment
        checkRateLimit(ipKey);
        return res.status(401).json({ error: 'بيانات غير صحيحة' });
      }

      // Check if trusted device
      const [trusted]: any = await pool.query(
        'SELECT id FROM trusted_devices WHERE user_id=? AND device_id=?',
        [userData.id, clientDeviceId]
      );

      if (trusted.length > 0) {
        // Trusted device - direct login
        await pool.query('UPDATE trusted_devices SET last_used=NOW() WHERE user_id=? AND device_id=?', [userData.id, clientDeviceId]);
        
        const newToken = generateToken({
          id: userData.id,
          role: userData.role,
          sub_role: userData.sub_role,
          email: userData.email,
          deviceId: clientDeviceId
        });
        
        // Clear rate limits on success
        clearRateLimit(emailKey);
        clearRateLimit(ipKey);
        
        const { password_hash, ...safeUser } = userData;
        return res.json({ user: safeUser, token: newToken, isTrustedDevice: true });
      }

      // New device - send OTP
      const otpRateCheck = checkRateLimit(`otp:${userData.email}`);
      if (!otpRateCheck.allowed) {
        return res.status(429).json({ error: `يرجى الانتظار ${Math.ceil((otpRateCheck.resetAt - Date.now()) / 1000)} ثانية` });
      }

      const otp = generateOTP();
      const expiresAt = new Date(Date.now() + 5 * 60 * 1000);
      
      await pool.query(
        `DELETE FROM otp_codes WHERE identifier=? AND type='login' AND used=false`,
        [userData.email]
      );

      await pool.query(
        `INSERT INTO otp_codes (identifier, code, type, user_data, device_id, expires_at) VALUES (?, ?, 'login', ?, ?, ?)`,
        [userData.email, otp, JSON.stringify({ userId: userData.id }), clientDeviceId, expiresAt]
      );

      // Send email
      sendOTPEmail(userData.email, otp, userData.name, 'login').catch(() => {});

      // If email skipped, include OTP in response for testing
      const response: any = { 
        requiresOTP: true, 
        email: userData.email, 
        message: `تم إرسال رمز التحقق إلى ${userData.email}`
      };
      if (SKIP_EMAIL) response.devOtp = otp;

      return res.json(response);
    } catch (err: any) {
      console.log('[ERROR] Login:', err.message);
      return res.status(500).json({ error: 'خطأ في تسجيل الدخول' });
    }
  }

  // POST /api/auth/login/verify-otp (exact match)
  if (method === 'POST' && cleanUrl === '/api/auth/login/verify-otp') {
    try {
      const { email, otp, rememberDevice, deviceName } = body;
      if (!email || !otp) {
        return res.status(400).json({ error: 'البريد الإلكتروني ورمز التحقق مطلوبان' });
      }

      const clientIP = headers['x-forwarded-for']?.split(',')[0]?.trim() || 'unknown';
      const clientDeviceId = Buffer.from(clientIP + (headers['user-agent'] || 'unknown')).toString('base64').slice(0, 64);

      const result = await consumeOTP(email, otp, 'login', pool);
      if (!result.valid) {
        return res.status(400).json({ error: result.error });
      }

      const [rows]: any = await pool.query('SELECT * FROM users WHERE email=? AND is_active != 0', [email]);
      if (rows.length === 0) {
        return res.status(401).json({ error: 'الحساب غير موجود' });
      }

      const userData = rows[0];
      const deviceIdResult = typeof result.userData === 'string' ? JSON.parse(result.userData) : result.userData;
      const finalDeviceId = deviceIdResult?.deviceId || clientDeviceId;

      if (rememberDevice) {
        await pool.query(
          `INSERT IGNORE INTO trusted_devices (user_id, device_id, device_name, last_used) VALUES (?, ?, ?, NOW())`,
          [userData.id, finalDeviceId, deviceName || null]
        );
      }

      const token = generateToken({
        id: userData.id,
        role: userData.role,
        sub_role: userData.sub_role,
        email: userData.email,
        deviceId: finalDeviceId
      });

      // Clear rate limits on success
      clearRateLimit(`login:${email}`);
      clearRateLimit(`ip:${clientIP}`);

      const { password_hash, ...safeUser } = userData;
      return res.json({ user: safeUser, token, isTrustedDevice: !!rememberDevice });
    } catch (err: any) {
      console.log('[ERROR] Login OTP verify:', err.message);
      return res.status(500).json({ error: 'خطأ في التحقق' });
    }
  }

  // POST /api/auth/resend-login-otp (exact match)
  if (method === 'POST' && cleanUrl === '/api/auth/resend-login-otp') {
    try {
      const { email } = body;
      if (!email) return res.status(400).json({ error: 'البريد الإلكتروني مطلوب' });

      const rateCheck = checkRateLimit(`otp:${email}`);
      if (!rateCheck.allowed) {
        return res.status(429).json({ error: `يرجى الانتظار ${Math.ceil((rateCheck.resetAt - Date.now()) / 1000)} ثانية` });
      }

      const [userRows]: any = await pool.query('SELECT id, name FROM users WHERE email=? AND is_active != 0', [email]);
      if (userRows.length === 0) {
        return res.status(404).json({ error: 'الحساب غير موجود' });
      }

      const user = userRows[0];
      const clientIP = headers['x-forwarded-for']?.split(',')[0]?.trim() || 'unknown';
      const clientDeviceId = Buffer.from(clientIP + (headers['user-agent'] || 'unknown')).toString('base64').slice(0, 64);

      const otp = generateOTP();
      const expiresAt = new Date(Date.now() + 5 * 60 * 1000);
      
      await pool.query(
        `DELETE FROM otp_codes WHERE identifier=? AND type='login' AND used=false`,
        [email]
      );

      await pool.query(
        `INSERT INTO otp_codes (identifier, code, type, user_data, device_id, expires_at) VALUES (?, ?, 'login', ?, ?, ?)`,
        [email, otp, JSON.stringify({ userId: user.id }), clientDeviceId, expiresAt]
      );

      sendOTPEmail(email, otp, user.name, 'login').catch(() => {});

      return res.json({ success: true, message: `تم إرسال رمز التحقق إلى ${email}` });
    } catch (err: any) {
      return res.status(500).json({ error: 'خطأ' });
    }
  }

  

  // POST /api/auth/register (exact match - no /verify, /resend, etc.)
  if (method === 'POST' && cleanUrl === '/api/auth/register') {
    try {
      const clientIP = headers['x-forwarded-for']?.split(',')[0]?.trim() || 'unknown';
      const rateCheck = checkRateLimit(`register:${clientIP}`);
      if (!rateCheck.allowed) {
        return res.status(429).json({ error: 'تجاوزت الحد. حاول لاحقاً' });
      }

      const { name, email, phone, password } = body;
      if (!name || !email || !phone || !password) {
        return res.status(400).json({ error: 'جميع الحقول مطلوبة' });
      }

      const sanitizedEmail = sanitizeEmail(email);
      const sanitizedPhone = sanitizePhone(phone);
      const sanitizedName = sanitizeString(name, 200);
      
      if (!validateEmail(sanitizedEmail)) {
        return res.status(400).json({ error: 'بريد إلكتروني غير صحيح' });
      }

      const passCheck = validatePassword(password);
      if (!passCheck.valid) {
        return res.status(400).json({ error: passCheck.error });
      }

      const [existing]: any = await pool.query('SELECT id FROM users WHERE email=? OR phone=?', [sanitizedEmail, sanitizedPhone]);
      if (existing.length > 0) {
        return res.status(400).json({ error: 'البريد الإلكتروني أو رقم الهاتف مسجل مسبقاً' });
      }

      // Rate limit on OTP sending
      const otpRateCheck = checkRateLimit(`otp:${sanitizedEmail}`);
      if (!otpRateCheck.allowed) {
        return res.status(429).json({ error: `يرجى الانتظار ${Math.ceil((otpRateCheck.resetAt - Date.now()) / 1000)} ثانية`, waitSeconds: Math.ceil((otpRateCheck.resetAt - Date.now()) / 1000) });
      }

      const bcrypt = await import('bcryptjs');
      const passwordHash = await bcrypt.hash(password, 12);
      
      // Issue OTP with user data embedded
      const otp = generateOTP();
      const expiresAt = new Date(Date.now() + 5 * 60 * 1000);
      
      await pool.query(
        `DELETE FROM otp_codes WHERE identifier=? AND type='register' AND used=false`,
        [sanitizedEmail]
      );

      await pool.query(
        `INSERT INTO otp_codes (identifier, code, type, user_data, expires_at) VALUES (?, ?, 'register', ?, ?)`,
        [sanitizedEmail, otp, JSON.stringify({ name: sanitizedName, email: sanitizedEmail, phone: sanitizedPhone, passwordHash }), expiresAt]
      );

      // Send email with OTP (fire and forget but log errors)
      sendOTPEmail(sanitizedEmail, otp, sanitizedName, 'register')
        .then((sent) => console.log('[EMAIL] Register OTP result:', sent))
        .catch((err) => {
          console.log('[EMAIL] Register OTP failed:', err?.message);
        });

      // If email skipped, include OTP in response for testing
      if (SKIP_EMAIL) {
        return res.json({ success: true, message: `تم إرسال رمز التحقق إلى ${sanitizedEmail} (OTP: ${otp})`, devOtp: otp });
      }

      return res.json({ success: true, message: `تم إرسال رمز التحقق إلى ${sanitizedEmail}` });
    } catch (err: any) {
      console.log('[ERROR] Register:', err.message);
      return res.status(500).json({ error: 'خطأ في التسجيل' });
    }
  }

  // POST /api/auth/register/verify (exact match)
  if (method === 'POST' && cleanUrl === '/api/auth/register/verify') {
    let userIdForCleanup: number | null = null;
    try {
      const { email, otp } = body;
      if (!email || !otp) {
        return res.status(400).json({ error: 'البريد الإلكتروني ورمز التحقق مطلوبان' });
      }

      const sanitizedEmail = sanitizeEmail(email);
      const result = await consumeOTP(sanitizedEmail, otp, 'register', pool);
      if (!result.valid) {
        return res.status(400).json({ error: result.error });
      }

      const userData = typeof result.userData === 'string' ? JSON.parse(result.userData) : result.userData;
      if (!userData?.passwordHash) {
        return res.status(400).json({ error: 'بيانات التحقق غير صالحة' });
      }

      const [existing]: any = await pool.query('SELECT id FROM users WHERE email=?', [sanitizedEmail]);
      if (existing.length > 0) {
        return res.status(400).json({ error: 'فشل التحقق. يرجى إعادة التسجيل' });
      }

      const [insertResult]: any = await pool.query(
        `INSERT INTO users (name, email, phone, password_hash, role, email_verified) VALUES (?, ?, ?, ?, 'user', false)`,
        [userData.name, sanitizedEmail, userData.phone, userData.passwordHash]
      );

      userIdForCleanup = insertResult.insertId;

      await pool.query(
        `INSERT INTO email_verification (user_id, is_verified) VALUES (?, false)`,
        [insertResult.insertId]
      );

      const token = generateToken({
        id: insertResult.insertId,
        role: 'user',
        email: sanitizedEmail
      });

      // Send email verification OTP asynchronously
      setTimeout(async () => {
        try {
          const bcrypt = await import('bcryptjs');
          const emailOtp = generateOTP();
          const expAt = new Date(Date.now() + 5 * 60 * 1000);
          await pool.query(
            `DELETE FROM otp_codes WHERE identifier=? AND type='email_verify' AND used=false`,
            [sanitizedEmail]
          );
          await pool.query(
            `INSERT INTO otp_codes (identifier, code, type, user_data, expires_at) VALUES (?, ?, 'email_verify', ?, ?)`,
            [sanitizedEmail, emailOtp, JSON.stringify({ userId: insertResult.insertId }), expAt]
          );
        } catch (e) {
          console.log('[email-verification-otp-error]', e);
        }
      }, 2000);

      return res.json({ 
        user: { id: insertResult.insertId, name: userData.name, email: sanitizedEmail, phone: userData.phone, role: 'user' },
        token,
        message: 'تم إنشاء الحساب بنجاح'
      });
    } catch (err: any) {
      console.log('[ERROR] Register verify:', err.message);
      if (userIdForCleanup) {
        await pool.query('DELETE FROM users WHERE id=?', [userIdForCleanup]).catch(() => {});
      }
      return res.status(500).json({ error: 'خطأ في التحقق' });
    }
  }

  // POST /api/auth/register/verify/resend (exact match)
  if (method === 'POST' && cleanUrl === '/api/auth/register/verify/resend') {
    console.log('[RESEND] Raw body:', JSON.stringify(body));
    try {
      const { email } = body;
      if (!email) return res.status(400).json({ error: 'البريد الإلكتروني مطلوب' });

      const sanitizedEmail = sanitizeEmail(email);
      if (!sanitizedEmail) return res.status(400).json({ error: 'بريد إلكتروني غير صحيح' });

      const rateCheck = checkRateLimit(`otp:${sanitizedEmail}`);
      if (!rateCheck.allowed) {
        return res.status(429).json({ error: `يرجى الانتظار ${Math.ceil((rateCheck.resetAt - Date.now()) / 1000)} ثانية` });
      }

      const otp = generateOTP();
      const expiresAt = new Date(Date.now() + 5 * 60 * 1000);
      
      await pool.query(
        `DELETE FROM otp_codes WHERE identifier=? AND type='register' AND used=false`,
        [sanitizedEmail]
      );

      await pool.query(
        `INSERT INTO otp_codes (identifier, code, type, expires_at) VALUES (?, ?, 'register', ?)`,
        [sanitizedEmail, otp, expiresAt]
      );

      sendOTPEmail(sanitizedEmail, otp, sanitizedEmail.split('@')[0], 'register').catch(() => {});

      // If email skipped, include OTP in response for testing
      if (SKIP_EMAIL) {
        return res.json({ success: true, message: `تم إعادة إرسال رمز التحقق (OTP: ${otp})`, devOtp: otp });
      }

      return res.json({ success: true, message: `تم إعادة إرسال رمز التحقق` });
    } catch (err: any) {
      console.log('[ERROR] Resend OTP:', err.message);
      return res.status(500).json({ error: 'خطأ' });
    }
  }

  // POST /api/auth/verify-email (exact match)
  if (method === 'POST' && cleanUrl === '/api/auth/verify-email') {
    try {
      const { email, otp } = body;
      if (!email || !otp) {
        return res.status(400).json({ error: 'البريد الإلكتروني ورمز التحقق مطلوبان' });
      }

      const sanitizedEmail = sanitizeEmail(email);
      const result = await consumeOTP(sanitizedEmail, otp, 'email_verify', pool);
      if (!result.valid) {
        return res.status(400).json({ error: result.error });
      }

      await pool.query(
        `UPDATE users SET email_verified=true, email_verified_at=NOW() WHERE email=?`,
        [sanitizedEmail]
      );

      await pool.query(
        `UPDATE email_verification SET is_verified=true, verified_at=NOW() WHERE user_id=(SELECT id FROM users WHERE email=?)`,
        [sanitizedEmail]
      );

      return res.json({ success: true, message: 'تم التحقق من البريد الإلكتروني بنجاح' });
    } catch (err: any) {
      console.log('[ERROR] Verify email:', err.message);
      return res.status(500).json({ error: 'خطأ' });
    }
  }

  // POST /api/auth/send-otp
  if (method === 'POST' && url?.includes('/api/auth/send-otp')) {
    try {
      // Rate limit check
      const rateCheck = checkRateLimit(`otp:${body.email}`);
      if (!rateCheck.allowed) {
        return res.status(429).json({ error: 'تجاوزت الحد. حاول بعد 60 ثانية' });
      }

      const { email, type = 'register' } = body;
      if (!email) return res.status(400).json({ error: 'البريد الإلكتروني مطلوب' });

      const sanitizedEmail = sanitizeEmail(email);

      const otp = generateOTP();
      const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

      await pool.query(
        `DELETE FROM otp_codes WHERE identifier=? AND type=? AND used=false`,
        [email, type]
      );

      await pool.query(
        `INSERT INTO otp_codes (identifier, code, type, expires_at) VALUES (?, ?, ?, ?)`,
        [email, otp, type, expiresAt]
      );

      return res.json({ success: true, message: `تم إنشاء رمز التحقق` });
    } catch (err: any) {
      console.log('[ERROR] Send OTP:', err.message);
      return res.status(500).json({ error: 'خطأ' });
    }
  }

  // POST /api/auth/verify-otp (must be after specific routes like register/verify/resend)
  if (method === 'POST' && url?.match(/^\/api\/auth\/verify-otp$/)) {
    try {
      const { email, otp, type = 'register' } = body;
      if (!email || !otp) {
        return res.status(400).json({ error: 'البريد الإلكتروني ورمز التحقق مطلوبان' });
      }

      const result = await consumeOTP(email, otp, type, pool);
      if (!result.valid) {
        return res.status(400).json({ error: result.error });
      }

      // If register type, create user
      if (type === 'register') {
        const userData = result.userData ? JSON.parse(result.userData) : {};
        const bcrypt = await import('bcryptjs');
        const hash = await bcrypt.hash(userData.passwordHash || 'default', 12);

        const [existing]: any = await pool.query('SELECT id FROM users WHERE email=?', [email]);
        if (existing.length === 0) {
          await pool.query(
            `INSERT INTO users (name, email, phone, password_hash, role) VALUES (?, ?, ?, ?, 'user')`,
            [userData.name || email, email, userData.phone || null, hash]
          );
        }
      }

      return res.json({ success: true, message: 'تم التحقق بنجاح' });
    } catch (err: any) {
      console.log('[ERROR] Verify OTP:', err.message);
      return res.status(500).json({ error: 'خطأ' });
    }
  }

  // POST /api/auth/forgot-password (check if user exists)
  if (method === 'POST' && url?.includes('/api/auth/forgot-password-check')) {
    try {
      const { email } = body;
      if (!email) return res.status(400).json({ error: 'البريد الإلكتروني مطلوب' });
      const [rows]: any = await pool.query('SELECT id FROM users WHERE email=? AND is_active=true', [email]);
      if (rows.length === 0) {
        return res.status(404).json({ error: 'لم يتم العثور على حساب بهذا البريد الإلكتروني' });
      }
      return res.json({ success: true });
    } catch (err: any) {
      return res.status(500).json({ error: 'خطأ' });
    }
  }

  // POST /api/auth/forgot-password (send OTP)
  if (method === 'POST' && url?.includes('/api/auth/forgot-password') && !url?.includes('check') && !url?.includes('reset')) {
    try {
      const { email } = body;
      if (!email) return res.status(400).json({ error: 'البريد الإلكتروني مطلوب' });

      // Rate limit
      const otpRateCheck = checkRateLimit(`otp:${email}`);
      if (!otpRateCheck.allowed) {
        return res.status(429).json({ error: `يرجى الانتظار ${Math.ceil((otpRateCheck.resetAt - Date.now()) / 1000)} ثانية` });
      }

      const [rows]: any = await pool.query('SELECT id, name FROM users WHERE email=? AND is_active=true', [email]);
      if (rows.length === 0) {
        return res.status(404).json({ error: 'لم يتم العثور على حساب بهذا البريد الإلكتروني' });
      }

      const user = rows[0];
      const otp = generateOTP();
      const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

      await pool.query(
        `DELETE FROM otp_codes WHERE identifier=? AND type='forgot-password' AND used=false`,
        [email]
      );

      await pool.query(
        `INSERT INTO otp_codes (identifier, code, type, user_data, expires_at) VALUES (?, ?, 'forgot-password', ?, ?)`,
        [email, otp, JSON.stringify({ userId: user.id }), expiresAt]
      );

      // Send email
      sendOTPEmail(email, otp, user.name, 'forgot-password').catch(() => {});

      if (SKIP_EMAIL) {
        return res.json({ success: true, devOtp: otp });
      }

      return res.json({ success: true });
    } catch (err: any) {
      return res.status(500).json({ error: 'خطأ' });
    }
  }

  // POST /api/auth/reset-password
  if (method === 'POST' && url?.includes('/api/auth/reset-password')) {
    try {
      const { email, otp, newPassword } = body;
      if (!email || !otp || !newPassword) {
        return res.status(400).json({ error: 'جميع الحقول مطلوبة' });
      }

      // Password validation
      const passCheck = validatePassword(newPassword);
      if (!passCheck.valid) {
        return res.status(400).json({ error: passCheck.error });
      }

      const result = await consumeOTP(email, otp, 'forgot-password', pool);
      if (!result.valid) return res.status(400).json({ error: result.error });

      const bcrypt = await import('bcryptjs');
      const hash = await bcrypt.hash(newPassword, 12);
      await pool.query('UPDATE users SET password_hash=? WHERE email=?', [hash, email]);

      // Delete trusted devices
      await pool.query(`DELETE FROM trusted_devices WHERE user_id=(SELECT id FROM users WHERE email=?)`, [email]);

      return res.json({ success: true, message: 'تم تغيير كلمة المرور بنجاح' });
    } catch (err: any) {
      return res.status(500).json({ error: 'خطأ' });
    }
  }

  // GET /api/auth/me
  if (method === 'GET' && url?.includes('/api/auth/me')) {
    if (!user) return res.status(401).json({ error: 'Unauthorized' });
    try {
      const [rows]: any = await pool.query(
        'SELECT id, name, email, phone, role, sub_role, avatar_url, email_verified, email_verified_at, created_at FROM users WHERE id=?',
        [user.id]
      );
      return res.json(rows[0] || { error: 'Not found' });
    } catch {
      return res.status(500).json({ error: 'خطأ' });
    }
  }

  // PUT /api/auth/profile
  if (method === 'PUT' && url?.includes('/api/auth/profile')) {
    if (!user) return res.status(401).json({ error: 'Unauthorized' });
    try {
      const { name, phone, avatar_url } = body;
      const [result]: any = await pool.query(
        `UPDATE users SET name=?, phone=?, avatar_url=? WHERE id=?`,
        [name, phone, avatar_url || null, user.id]
      );
      return res.json({ success: true });
    } catch {
      return res.status(500).json({ error: 'خطأ' });
    }
  }

  // PUT /api/auth/change-password
  if (method === 'PUT' && url?.includes('/api/auth/change-password')) {
    if (!user) return res.status(401).json({ error: 'Unauthorized' });
    try {
      const { currentPassword, newPassword } = body;
      if (!currentPassword || !newPassword) {
        return res.status(400).json({ error: 'جميع الحقول مطلوبة' });
      }
      if (newPassword.length < 8) {
        return res.status(400).json({ error: 'كلمة المرور يجب أن تكون 8 أحرف على الأقل' });
      }

      const [rows]: any = await pool.query('SELECT password_hash FROM users WHERE id=?', [user.id]);
      const bcrypt = await import('bcryptjs');
      const valid = await bcrypt.compare(currentPassword, rows[0].password_hash);
      if (!valid) return res.status(400).json({ error: 'كلمة المرور الحالية غير صحيحة' });

      const newHash = await bcrypt.hash(newPassword, 12);
      await pool.query('UPDATE users SET password_hash=? WHERE id=?', [newHash, user.id]);

      return res.json({ success: true, message: 'تم تغيير كلمة المرور' });
    } catch {
      return res.status(500).json({ error: 'خطأ' });
    }
  }

  // ========== PROPERTIES ENDPOINTS ==========

  // GET /api/properties/user/saved - specific endpoint first
  if (method === 'GET' && url?.startsWith('/api/properties/user/saved')) {
    if (!user) return res.status(401).json({ error: 'Unauthorized' });
    try {
      const [rows]: any = await pool.query(`
        SELECT p.*, (SELECT pi.url FROM property_images pi WHERE pi.property_id = p.id AND pi.is_primary = true LIMIT 1) as primary_image
        FROM saved_properties sp JOIN properties p ON p.id = sp.property_id WHERE sp.user_id = ?
      `, [user.id]);
      return res.json(rows);
    } catch {
      return res.status(500).json({ error: 'خطأ' });
    }
  }

  // GET /api/properties/featured - must check exact path
  if (method === 'GET' && url?.startsWith('/api/properties/featured')) {
    try {
      const [rows]: any = await pool.query(`
        SELECT p.*,
          (SELECT pi.url FROM property_images pi WHERE pi.property_id = p.id AND pi.is_primary = true LIMIT 1) as primary_image
        FROM properties p WHERE p.status = 'approved' AND p.is_featured = true
        ORDER BY p.created_at DESC LIMIT 6
      `);
      
      for (const prop of rows) {
        const [imgs]: any = await pool.query('SELECT id, url, is_primary FROM property_images WHERE property_id = ?', [prop.id]);
        prop.images = imgs;
      }
      
      return res.json(rows);
    } catch {
      return res.status(500).json({ error: 'خطأ' });
    }
  }

  // GET /api/properties/:id - numeric ID
  if (method === 'GET' && url?.match(/^\/api\/properties\/\d+$/)) {
    try {
      const idStr = url.match(/\/api\/properties\/(\d+)/)?.[1];
      const id = validateId(idStr);
      if (!id) return res.status(400).json({ error: 'معرف غير صالح' });
      
      const [rows]: any = await pool.query(`
        SELECT p.*, u.name as owner_name, u.phone as owner_phone, u.email as owner_email
        FROM properties p LEFT JOIN users u ON u.id = p.owner_id WHERE p.id = ?
      `, [id]);

      if (rows.length === 0) {
        return res.status(404).json({ error: 'العقار غير موجود' });
      }
      
      const [imgs]: any = await pool.query('SELECT id, url, is_primary FROM property_images WHERE property_id = ?', [id]);
      rows[0].images = imgs;

      await pool.query('UPDATE properties SET views = views + 1 WHERE id = ?', [id]);

      return res.json(rows[0]);
    } catch {
      return res.status(500).json({ error: 'خطأ' });
    }
  }

  // GET /api/properties - list all (catch-all at the end)
  if (method === 'GET' && url?.startsWith('/api/properties')) {
    try {
      const { type, purpose, district, minPrice, maxPrice, rooms, search, page = 1, limit = 12 } = urlQuery;
      let conditions = ["p.status = 'approved'"];
      const params: any[] = [];

      if (type) { conditions.push(`p.type = ?`); params.push(type); }
      if (purpose) { conditions.push(`p.purpose = ?`); params.push(purpose); }
      if (district) { conditions.push(`p.district LIKE ?`); params.push(`%${district}%`); }
      if (minPrice) { conditions.push(`p.price >= ?`); params.push(Number(minPrice)); }
      if (maxPrice) { conditions.push(`p.price <= ?`); params.push(Number(maxPrice)); }
      if (rooms) { conditions.push(`p.rooms >= ?`); params.push(Number(rooms)); }
      if (search) {
        const sanitized = search.replace(/[<>'";&]/g, '').slice(0, 100);
        conditions.push(`(p.title LIKE ? OR p.title_ar LIKE ? OR p.district LIKE ?)`);
        params.push(`%${sanitized}%`, `%${sanitized}%`, `%${sanitized}%`);
      }

      const where = conditions.length ? 'WHERE ' + conditions.join(' AND ') : '';
      const offset = (Number(page) - 1) * Number(limit);

      const [rows]: any = await pool.query(`
        SELECT p.*, u.name as owner_name,
          (SELECT pi.url FROM property_images pi WHERE pi.property_id = p.id AND pi.is_primary = true LIMIT 1) as primary_image
        FROM properties p
        LEFT JOIN users u ON u.id = p.owner_id
        ${where}
        ORDER BY p.is_featured DESC, p.created_at DESC
        LIMIT ? OFFSET ?
      `, [...params, Number(limit), offset]);
      
      // Get images separately for each property
      for (const prop of rows) {
        const [imgs]: any = await pool.query('SELECT id, url, is_primary FROM property_images WHERE property_id = ? LIMIT 5', [prop.id]);
        prop.images = imgs;
      }

      return res.json({ properties: rows, page: Number(page) });
    } catch (err: any) {
      console.log('[ERROR] Properties:', err.message);
      return res.status(500).json({ error: err.message });
    }
  }

  // POST /api/properties
  if (method === 'POST' && url?.includes('/api/properties')) {
    if (!user) return res.status(401).json({ error: 'Unauthorized' });
    try {
      const {
        title, title_ar, description, type, purpose, price, area, rooms, bedrooms, bathrooms, floor,
        address, district, contact_phone, down_payment, delivery_status, is_featured, images,
        is_furnished, has_parking, has_elevator, has_pool, has_garden, has_basement,
        finishing_type, floor_plan_image, google_maps_url
      } = body;

      const displayTitle = title_ar || title || '';
      const isStaff = user.role === 'superadmin' || (user.role === 'admin' && ['data_entry', 'property_manager'].includes(user.sub_role || ''));
      const initialStatus = isStaff ? 'approved' : 'pending';
      const finalPhone = contact_phone || user.phone || '01100111618';

      const [result]: any = await pool.query(`
        INSERT INTO properties (
          title, title_ar, description, description_ar, type, purpose, price, area, rooms, bedrooms,
          bathrooms, floor, address, district, contact_phone, down_payment, delivery_status,
          is_featured, is_furnished, has_parking, has_elevator, has_pool, has_garden, has_basement,
          finishing_type, floor_plan_image, google_maps_url, owner_id, status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        displayTitle, displayTitle, description, description, type, purpose || 'sale', price, area,
        rooms || bedrooms, bedrooms || rooms, bathrooms, floor, address, district, finalPhone,
        down_payment || null, delivery_status || null,
        Boolean(is_featured), Boolean(is_furnished), Boolean(has_parking), Boolean(has_elevator),
        Boolean(has_pool), Boolean(has_garden), Boolean(has_basement),
        finishing_type || null, floor_plan_image || null, google_maps_url || null,
        user.id, initialStatus
      ]);

      const propertyId = result.insertId;

      if (images && images.length > 0) {
        for (let i = 0; i < images.length; i++) {
          await pool.query(
            'INSERT INTO property_images (property_id, url, is_primary, order_index) VALUES (?, ?, ?, ?)',
            [propertyId, images[i], i === 0, i]
          );
        }
      }

      return res.status(201).json({ id: propertyId, status: initialStatus, message: initialStatus === 'pending' ? 'تم إرسال العقار للمراجعة' : 'تم إضافة العقار' });
    } catch (err: any) {
      console.log('[ERROR] Create property:', err.message);
      return res.status(500).json({ error: err.message });
    }
  }

  // POST /api/properties/:id/save
  if (method === 'POST' && url?.match(/\/api\/properties\/\d+\/save$/)) {
    if (!user) return res.status(401).json({ error: 'Unauthorized' });
    try {
      const idStr = url.match(/\/api\/properties\/(\d+)\/save/)?.[1];
      const id = validateId(idStr);
      if (!id) return res.status(400).json({ error: 'معرف غير صالح' });
      
      await pool.query('INSERT IGNORE INTO saved_properties (user_id, property_id) VALUES (?, ?)', [user.id, id]);
      return res.json({ saved: true });
    } catch {
      return res.status(500).json({ error: 'خطأ' });
    }
  }

  // DELETE /api/properties/:id/save
  if (method === 'DELETE' && url?.match(/\/api\/properties\/\d+\/save$/)) {
    if (!user) return res.status(401).json({ error: 'Unauthorized' });
    try {
      const idStr = url.match(/\/api\/properties\/(\d+)\/save/)?.[1];
      const id = validateId(idStr);
      if (!id) return res.status(400).json({ error: 'معرف غير صالح' });
      await pool.query('DELETE FROM saved_properties WHERE user_id=? AND property_id=?', [user.id, id]);
      return res.json({ saved: false });
    } catch {
      return res.status(500).json({ error: 'خطأ' });
    }
  }

  // ========== ADMIN ENDPOINTS ==========

  // GET /api/admin/stats
  if (method === 'GET' && url?.includes('/api/admin/stats')) {
    if (!user || !['admin', 'superadmin'].includes(user.role)) {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    try {
      const [[props], [users], [pending], [sold], [revenue]] = await Promise.all([
        pool.query("SELECT COUNT(*) as cnt FROM properties WHERE status='approved'"),
        pool.query("SELECT COUNT(*) as cnt FROM users WHERE role='user'"),
        pool.query("SELECT COUNT(*) as cnt FROM properties WHERE status='pending'"),
        pool.query("SELECT COUNT(*) as cnt FROM properties WHERE status='sold'"),
        pool.query("SELECT COALESCE(SUM(amount),0) as total FROM payment_requests WHERE status='completed'"),
      ]);
      return res.json({
        totalProperties: props[0]?.cnt || 0,
        totalUsers: users[0]?.cnt || 0,
        pendingProperties: pending[0]?.cnt || 0,
        soldProperties: sold[0]?.cnt || 0,
        totalRevenue: revenue[0]?.total || 0,
      });
    } catch {
      return res.status(500).json({ error: 'خطأ' });
    }
  }

  // GET /api/admin/properties
  if (method === 'GET' && url?.includes('/api/admin/properties')) {
    if (!user || !['admin', 'superadmin'].includes(user.role)) {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    try {
      const [rows]: any = await pool.query(`
        SELECT p.*,
          u.name as owner_name, u.email as owner_email, u.phone as owner_phone,
          (SELECT pi.url FROM property_images pi WHERE pi.property_id = p.id AND pi.is_primary=true LIMIT 1) as primary_image
        FROM properties p LEFT JOIN users u ON u.id = p.owner_id ORDER BY p.created_at DESC
      `);
      return res.json(rows);
    } catch {
      return res.status(500).json({ error: 'خطأ' });
    }
  }

// GET /api/admin/properties/:id
  if (method === 'GET' && url?.match(/\/api\/admin\/properties\/\d+$/)) {
    if (!user || !['admin', 'superadmin'].includes(user.role)) {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    try {
      const idStr = url.match(/\/api\/admin\/properties\/(\d+)/)?.[1];
      const id = validateId(idStr);
      if (!id) return res.status(400).json({ error: 'معرف غير صالح' });
      
      const [rows]: any = await pool.query(`
        SELECT p.*,
          u.name as owner_name, u.email as owner_email, u.phone as owner_phone, u.id as owner_user_id
        FROM properties p LEFT JOIN users u ON u.id = p.owner_id WHERE p.id=?
      `, [id]);
      return res.json(rows[0] || { error: 'Not found' });
    } catch {
      return res.status(500).json({ error: 'خطأ' });
    }
  }

  // PATCH /api/admin/properties/:id/approve
  if (method === 'PATCH' && url?.match(/\/api\/admin\/properties\/\d+\/approve$/)) {
    if (!user || !['admin', 'superadmin'].includes(user.role)) {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    try {
      const idStr = url.match(/\/api\/admin\/properties\/(\d+)\/approve/)?.[1];
      const id = validateId(idStr);
      if (!id) return res.status(400).json({ error: 'معرف غير صالح' });
      
      await pool.query(
        `UPDATE properties SET status='approved', approved_by=?, approved_at=NOW() WHERE id=?`,
        [user.id, id]
      );

      const [propRows]: any = await pool.query('SELECT owner_id FROM properties WHERE id=?', [id]);
      if (propRows[0]?.owner_id) {
        await pool.query(
          `INSERT INTO notifications (user_id, type, title, message) VALUES (?, 'property_approved', 'تمت الموافقة على عقارك', 'تمت الموافقة على عقارك')`,
          [propRows[0].owner_id]
        );
      }

      return res.json({ success: true });
    } catch {
      return res.status(500).json({ error: 'خطأ' });
    }
  }

  // PATCH /api/admin/properties/:id/reject
  if (method === 'PATCH' && url?.match(/\/api\/admin\/properties\/\d+\/reject$/)) {
    if (!user || !['admin', 'superadmin'].includes(user.role)) {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    try {
      const idStr = url.match(/\/api\/admin\/properties\/(\d+)\/reject/)?.[1];
      const id = validateId(idStr);
      if (!id) return res.status(400).json({ error: 'معرف غير صالح' });
      
      await pool.query("UPDATE properties SET status='rejected' WHERE id=?", [id]);
      return res.json({ success: true });
    } catch {
      return res.status(500).json({ error: 'خطأ' });
    }
  }

  // PATCH /api/admin/properties/:id
  if (method === 'PATCH' && url?.match(/\/api\/admin\/properties\/\d+$/)) {
    if (!user || !['admin', 'superadmin'].includes(user.role)) {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    try {
      const idStr = url.match(/\/api\/admin\/properties\/(\d+)/)?.[1];
      const id = validateId(idStr);
      if (!id) return res.status(400).json({ error: 'معرف غير صالح' });
      
      const {
        title, title_ar, description, price, area, bedrooms, bathrooms, district,
        city, address, type, purpose, floor, contact_phone, is_featured
      } = body;

      await pool.query(`
        UPDATE properties SET
          title=COALESCE(?, title), title_ar=COALESCE(?, title_ar),
          description=COALESCE(?, description), price=?, area=?, bedrooms=?, bathrooms=?,
          district=?, city=?, address=?, type=?, purpose=?, floor=?, contact_phone=?,
          is_featured=?, updated_at=NOW()
        WHERE id=?
      `, [
        title, title_ar, description, price, area, bedrooms, bathrooms,
        district, city, address, type, purpose, floor, contact_phone,
        typeof is_featured === 'boolean' ? is_featured : null,
        id
      ]);

      return res.json({ success: true });
    } catch {
      return res.status(500).json({ error: 'خطأ' });
    }
  }

  // DELETE /api/admin/properties/:id
  if (method === 'DELETE' && url?.match(/\/api\/admin\/properties\/\d+/)) {
    if (!user || !['admin', 'superadmin'].includes(user.role)) {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    try {
      const idStr = url.match(/\/api\/admin\/properties\/(\d+)/)?.[1];
      const id = validateId(idStr);
      if (!id) return res.status(400).json({ error: 'معرف غير صالح' });
      
      await pool.query('DELETE FROM property_images WHERE property_id=?', [id]);
      await pool.query('DELETE FROM properties WHERE id=?', [id]);
      return res.json({ success: true });
    } catch {
      return res.status(500).json({ error: 'خطأ' });
    }
  }

  // GET /api/admin/users
  if (method === 'GET' && url?.includes('/api/admin/users')) {
    if (!user || user.role !== 'superadmin') {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    try {
      const [rows]: any = await pool.query(
        'SELECT id, name, email, phone, role, sub_role, is_active, created_at FROM users ORDER BY created_at DESC'
      );
      return res.json(rows);
    } catch {
      return res.status(500).json({ error: 'خطأ' });
    }
  }

  // PATCH /api/admin/users/:id/role
  if (method === 'PATCH' && url?.match(/\/api\/admin\/users\/\d+\/role$/)) {
    if (!user || user.role !== 'superadmin') {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    try {
      const idStr = url.match(/\/api\/admin\/users\/(\d+)\/role/)?.[1];
      const id = validateId(idStr);
      if (!id) return res.status(400).json({ error: 'معرف غير صالح' });
      
      const roleStr = body.role;
      const allowedRoles = ['user', 'admin', 'superadmin'];
      const validRole = validateEnum(roleStr, allowedRoles);
      if (!validRole) return res.status(400).json({ error: 'دور غير صالح' });
      
      await pool.query('UPDATE users SET role=?, sub_role=? WHERE id=?', [validRole, body.sub_role || null, id]);
      return res.json({ success: true });
    } catch {
      return res.status(500).json({ error: 'خطأ' });
    }
  }

  // ========== NOTIFICATIONS ENDPOINTS ==========

  // GET /api/notifications
  if (method === 'GET' && url?.includes('/api/notifications')) {
    if (!user) return res.status(401).json({ error: 'Unauthorized' });
    try {
      const [rows]: any = await pool.query(
        'SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 50',
        [user.id]
      );
      return res.json(rows);
    } catch {
      return res.status(500).json({ error: 'خطأ' });
    }
  }

  // GET /api/notifications/unread-count
  if (method === 'GET' && url?.includes('/api/notifications/unread-count')) {
    if (!user) return res.status(401).json({ error: 'Unauthorized' });
    try {
      const [[row]]: any = await pool.query(
        'SELECT COUNT(*) as cnt FROM notifications WHERE user_id = ? AND is_read = false',
        [user.id]
      );
      return res.json({ count: row?.cnt || 0 });
    } catch {
      return res.status(500).json({ error: 'خطأ' });
    }
  }

  // PATCH /api/notifications/mark-all-read
  if (method === 'PATCH' && url?.includes('/api/notifications/mark-all-read')) {
    if (!user) return res.status(401).json({ error: 'Unauthorized' });
    try {
      await pool.query('UPDATE notifications SET is_read = true WHERE user_id = ?', [user.id]);
      return res.json({ success: true });
    } catch {
      return res.status(500).json({ error: 'خطأ' });
    }
  }

  // ========== CONTACT ENDPOINTS ==========

  // POST /api/contact
  if (method === 'POST' && url?.includes('/api/contact')) {
    try {
      // Rate limit check
      const clientIP = headers['x-forwarded-for']?.split(',')[0]?.trim() || 'unknown';
      const rateCheck = checkRateLimit(`contact:${clientIP}`);
      if (!rateCheck.allowed) {
        return res.status(429).json({ error: 'تجاوزت الحد. حاول لاحقاً' });
      }

      const { name, email, phone, subject, message } = body;
      if (!name || !email || !subject || !message) {
        return res.status(400).json({ error: 'جميع الحقول المطلوبة يجب ملؤها' });
      }

      // Input sanitization
      const sanitizedName = sanitizeString(name, 200);
      const sanitizedEmail = sanitizeEmail(email);
      const sanitizedPhone = sanitizePhone(phone);
      const sanitizedSubject = sanitizeString(subject, 300);
      const sanitizedMessage = sanitizeString(message, 5000);

      if (!validateEmail(sanitizedEmail)) {
        return res.status(400).json({ error: 'بريد إلكتروني غير صحيح' });
      }

      await pool.query(
        `INSERT INTO contact_messages (name, email, phone, subject, message) VALUES (?, ?, ?, ?, ?)`,
        [sanitizedName, sanitizedEmail, sanitizedPhone, sanitizedSubject, sanitizedMessage]
      );

      return res.json({ success: true });
    } catch (err: any) {
      console.log('[ERROR] Contact:', err.message);
      return res.status(500).json({ error: 'خطأ' });
    }
  }

  // GET /api/contact (admin only)
  if (method === 'GET' && url?.includes('/api/contact')) {
    if (!user || !['admin', 'superadmin'].includes(user.role)) {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    try {
      const [rows]: any = await pool.query('SELECT * FROM contact_messages ORDER BY created_at DESC');
      return res.json(rows);
    } catch {
      return res.status(500).json({ error: 'خطأ' });
    }
  }

  // ========== PAYMENTS ENDPOINTS ==========

  // POST /api/payments
  if (method === 'POST' && url?.includes('/api/payments')) {
    if (!user) return res.status(401).json({ error: 'Unauthorized' });
    try {
      const { property_id, amount, payment_method, notes, screenshot_url } = body;

      const [propRows]: any = await pool.query("SELECT * FROM properties WHERE id=? AND status='approved'", [property_id]);
      if (propRows.length === 0) {
        return res.status(404).json({ error: 'العقار غير متاح' });
      }

      const prop = propRows[0];
      const contactPhone = prop.contact_phone || '01100111618';

      const [result]: any = await pool.query(
        `INSERT INTO payment_requests (property_id, buyer_id, amount, payment_method, notes, screenshot_url, contact_phone, status) VALUES (?, ?, ?, ?, ?, ?, ?, 'pending')`,
        [property_id, user.id, amount, payment_method, notes, screenshot_url || null, contactPhone]
      );

      // Notify admins
      const [admins]: any = await pool.query("SELECT id FROM users WHERE role IN ('admin','superadmin')");
      for (const admin of admins) {
        await pool.query(
          `INSERT INTO notifications (user_id, type, title, message) VALUES (?, 'purchase_request', 'طلب شراء جديد', ?)`,
          [admin.id, `طلب شراء من ${user.email} - المبلغ: ${amount}`]
        );
      }

      return res.status(201).json({
        payment: result,
        walletInfo: {
          instapay: contactPhone,
          vodafone: contactPhone,
          message: `يرجى تحويل مبلغ ${amount} جنيه`
        }
      });
    } catch (err: any) {
      console.log('[ERROR] Payment:', err.message);
      return res.status(500).json({ error: 'خطأ' });
    }
  }

  // GET /api/payments/my-payments
  if (method === 'GET' && url?.includes('/api/payments/my-payments')) {
    if (!user) return res.status(401).json({ error: 'Unauthorized' });
    try {
      const [rows]: any = await pool.query(`
        SELECT pr.*, p.title as property_title
        FROM payment_requests pr
        LEFT JOIN properties p ON p.id = pr.property_id
        WHERE pr.buyer_id = ? ORDER BY pr.created_at DESC
      `, [user.id]);
      return res.json(rows);
    } catch {
      return res.status(500).json({ error: 'خطأ' });
    }
  }

  // ========== SUPPORT ENDPOINTS ==========

  // POST /api/support/tickets
  if (method === 'POST' && url?.includes('/api/support/tickets')) {
    if (!user) return res.status(401).json({ error: 'Unauthorized' });
    try {
      const { subject } = body;
      const [result]: any = await pool.query(
        "INSERT INTO support_tickets (user_id, subject, status) VALUES (?, ?, 'open')",
        [user.id, subject]
      );
      return res.status(201).json(result);
    } catch {
      return res.status(500).json({ error: 'خطأ' });
    }
  }

  // GET /api/support/tickets
  if (method === 'GET' && url?.includes('/api/support/tickets')) {
    if (!user) return res.status(401).json({ error: 'Unauthorized' });
    try {
      let rows;
      if (['admin', 'superadmin'].includes(user.role) || user.sub_role === 'support') {
        [rows] = await pool.query(`
          SELECT st.*, u.name as user_name, u.phone as user_phone, u.email as user_email
          FROM support_tickets st JOIN users u ON u.id = st.user_id ORDER BY st.created_at DESC
        `);
      } else {
        [rows] = await pool.query('SELECT * FROM support_tickets WHERE user_id=? ORDER BY created_at DESC', [user.id]);
      }
      return res.json(rows);
    } catch {
      return res.status(500).json({ error: 'خطأ' });
    }
  }

  // ========== PROPERTY CHAT ENDPOINTS ==========

  // GET /api/property-chat/:propertyId/messages
  if (method === 'GET' && url?.match(/\/api\/property-chat\/\d+\/messages$/)) {
    if (!user) return res.status(401).json({ error: 'Unauthorized' });
    try {
      const propertyIdStr = url.match(/\/api\/property-chat\/(\d+)\/messages/)?.[1];
      const propertyId = validateId(propertyIdStr);
      if (!propertyId) return res.status(400).json({ error: 'معرف غير صالح' });
      
      const [rows]: any = await pool.query(`
        SELECT m.*, u.name as sender_name, u.role as sender_role
        FROM property_chat_messages m
        JOIN users u ON u.id = m.sender_id
        WHERE m.property_id = ?
        ORDER BY m.created_at ASC
      `, [propertyId]);
      return res.json(rows);
    } catch {
      return res.status(500).json({ error: 'خطأ' });
    }
  }

  // POST /api/property-chat/:propertyId/messages
  if (method === 'POST' && url?.match(/\/api\/property-chat\/\d+\/messages$/)) {
    if (!user) return res.status(401).json({ error: 'Unauthorized' });
    try {
      const propertyIdStr = url.match(/\/api\/property-chat\/(\d+)\/messages/)?.[1];
      const propertyId = validateId(propertyIdStr);
      if (!propertyId) return res.status(400).json({ error: 'معرف غير صالح' });
      
      const content = sanitizeString(body.content, 2000);
      if (!content.trim()) return res.status(400).json({ error: 'الرسالة مطلوبة' });

      const isAdmin = ['superadmin', 'admin'].includes(user.role);

      const [result]: any = await pool.query(
        `INSERT INTO property_chat_messages (property_id, sender_id, content, is_admin) VALUES (?, ?, ?, ?)`,
        [propertyId, user.id, content.trim(), isAdmin]
      );

      return res.status(201).json({ id: result.insertId, content: content.trim(), is_admin: isAdmin });
    } catch {
      return res.status(500).json({ error: 'خطأ' });
    }
  }

  // ========== HEALTH CHECK ==========

  // GET /api/health
  if (method === 'GET' && url?.includes('/api/health')) {
    let dbStatus = 'error';
    let initDone = false;
    try {
      const conn = await pool.getConnection();
      await conn.ping();
      conn.release();
      dbStatus = 'connected';
      
      // Auto-seed accounts if none exist
      const [userResult]: any = await pool.query('SELECT COUNT(*) as cnt FROM users');
      const userCount = userResult[0]?.cnt || 0;
      
      if (userCount === 0) {
        initDone = true;
        const bcrypt = await import('bcryptjs');
        // Create superadmin
        const hash = await bcrypt.hash('Admin@GreatSociety1', 10);
        await pool.query(
          `INSERT INTO users (name, email, phone, password_hash, role) VALUES (?, ?, ?, ?, ?)`,
          ['Super Admin', 'admin@greatsociety.com', '01100111618', hash, 'superadmin']
        );
      }
      
      // Get stats
      const [usersResult]: any = await pool.query('SELECT COUNT(*) as cnt FROM users');
      const [propsResult]: any = await pool.query('SELECT COUNT(*) as cnt FROM properties');
      const [approvedResult]: any = await pool.query("SELECT COUNT(*) as cnt FROM properties WHERE status='approved'");
      
      await pool.end();
      return res.json({ 
        ok: true, 
        service: 'Great Society API', 
        db: dbStatus, 
        init: initDone,
        stats: {
          users: usersResult[0]?.cnt || 0,
          properties: propsResult[0]?.cnt || 0,
          approved: approvedResult[0]?.cnt || 0
        },
        timestamp: new Date().toISOString() 
      });
    } catch (e: any) {
      dbStatus = "error: " + e.message;
      await pool.end();
      return res.json({ ok: true, service: 'Great Society API', db: dbStatus });
    }
  }

  // GET /api/debug-users - Debug: list users (dev only)
  if (method === 'GET' && url?.includes('/api/debug-users')) {
    try {
      const [rows]: any = await pool.query('SELECT id, name, email, role, is_active FROM users LIMIT 10');
      await pool.end();
      return res.json({ users: rows });
    } catch (e: any) {
      await pool.end();
      return res.json({ error: e.message });
    }
  }

  // POST /api/seed - Seed sample properties (for testing only)
  if (method === 'POST' && url?.includes('/api/seed')) {
    if (!user || user.role !== 'superadmin') {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    
    const sampleProperties = [
      { title: 'شقةLuxury في مصر الجديدة', title_ar: 'شقة 3 غرف بمصر الجديدة', type: 'apartment', purpose: 'sale', price: 2500000, area: 150, rooms: 3, bedrooms: 3, bathrooms: 2, floor: 3, district: 'مصر الجديدة', city: 'القاهرة', is_featured: true },
      { title: 'فيلا With Garden in maadi', title_ar: 'فياكلا حديقة بالشيخ زايد', type: 'villa', purpose: 'sale', price: 5500000, area: 350, rooms: 5, bedrooms: 4, bathrooms: 3, floor: 2, district: 'الشيخ زايد', city: 'الجيزة', is_featured: true },
      { title: 'Studio in New Cairo', title_ar: 'استوديوووو بالمقطعة', type: 'apartment', purpose: 'rent', price: 15000, area: 80, rooms: 1, bedrooms: 1, bathrooms: 1, floor: 5, district: 'المقطعة', city: 'القاهرة', is_featured: false },
      { title: 'Shop in Heliopolis', title_ar: 'محل تجاري بالماظة', type: 'commercial', purpose: 'sale', price: 3500000, area: 120, rooms: 1, bedrooms: 0, bathrooms: 1, floor: 0, district: 'الماظة', city: 'القاهرة', is_featured: false },
      { title: 'Land in New Capital', title_ar: 'ارض بال首都 الجديدة', type: 'land', purpose: 'sale', price: 8000000, area: 600, rooms: 0, bedrooms: 0, bathrooms: 0, floor: 0, district: 'ال首都 الجديد', city: 'القاهرة الجديدة', is_featured: true },
    ];
    
    try {
      for (const prop of sampleProperties) {
        const [result]: any = await pool.query(
          `INSERT INTO properties (title, title_ar, type, purpose, price, area, rooms, bedrooms, bathrooms, floor, district, city, owner_id, status, is_featured) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'approved', ?)`,
          [prop.title, prop.title_ar, prop.type, prop.purpose, prop.price, prop.area, prop.rooms, prop.bedrooms, prop.bathrooms, prop.floor, prop.district, prop.city, user.id, prop.is_featured]
        );
      }
      
      return res.json({ success: true, count: sampleProperties.length });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  }

  // ========== CRON ==========

  // GET /api/cron
  if (method === 'GET' && url?.includes('/api/cron')) {
    try {
      // Cleanup old OTPs (MySQL syntax)
      const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().slice(0, 19).replace('T', ' ');
      await pool.query(`DELETE FROM otp_codes WHERE expires_at < NOW() OR (used = true AND created_at < ?)`, [yesterday]);
      console.log('[CRON] Cleanup completed');
      return res.json({ success: true });
    } catch (err: any) {
      console.log('[CRON] Error:', err.message);
      return res.status(500).json({ error: err.message });
    }
  }

  // Default response
  await pool.end();
  return res.json({ ok: true, service: 'Great Society API' });
  } catch (err: any) {
    console.error('[ERROR]', err.message);
    const origin = req.headers.origin;
    const allowedOrigin = ALLOWED_ORIGINS.includes(origin) ? origin : (ALLOWED_ORIGINS[0] || '*');
    res.setHeader('Access-Control-Allow-Origin', allowedOrigin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    return res.status(500).json({ ok: false, error: err.message || 'Internal server error' });
  }
}