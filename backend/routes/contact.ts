import { Router, Request, Response } from 'express';
import { query } from '../db.js';
import { authenticate, requireAdmin, AuthRequest } from '../middleware/auth.js';

const router = Router();

const CONTACT_RATE_LIMIT = 3;
const CONTACT_WINDOW = 60 * 1000;
const contactSubmissions = new Map<string, { count: number; resetAt: number }>();

async function ensureTable() {
  await query(`
    CREATE TABLE IF NOT EXISTS contact_messages (
      id SERIAL PRIMARY KEY,
      name VARCHAR(200) NOT NULL,
      email VARCHAR(200) NOT NULL,
      phone VARCHAR(30),
      subject VARCHAR(300) NOT NULL,
      message TEXT NOT NULL,
      ip_address VARCHAR(50),
      is_read BOOLEAN DEFAULT false,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `);
  
  await query(`ALTER TABLE contact_messages ADD COLUMN IF NOT EXISTS ip_address VARCHAR(50)`).catch(() => {});
  await query(`CREATE INDEX IF NOT EXISTS idx_contact_ip ON contact_messages(ip_address)`).catch(() => {});
}
ensureTable().catch(console.error);

function checkContactRateLimit(ip: string): boolean {
  const now = Date.now();
  const record = contactSubmissions.get(ip);
  if (!record || now > record.resetAt) {
    contactSubmissions.set(ip, { count: 1, resetAt: now + CONTACT_WINDOW });
    return true;
  }
  if (record.count >= CONTACT_RATE_LIMIT) {
    return false;
  }
  record.count++;
  return true;
}

function getClientIP(req: Request): string {
  const forwarded = req.headers['x-forwarded-for'] as string;
  return forwarded ? forwarded.split(',')[0].trim() : req.ip || 'unknown';
}

router.post('/', async (req: Request, res: Response) => {
  try {
    const clientIP = getClientIP(req);
    
    if (!checkContactRateLimit(clientIP)) {
      return res.status(429).json({ error: 'تجاوزت الحد المرسل. حاول لاحقاً' });
    }

    const { name, email, phone, subject, message } = req.body;
    if (!name || !email || !subject || !message) {
      return res.status(400).json({ error: 'جميع الحقول المطلوبة يجب ملؤها' });
    }
    
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ error: 'بريد إلكتروني غير صحيح' });
    }
    
    if (subject.length > 300 || message.length > 5000) {
      return res.status(400).json({ error: 'الرسالة طويلة جداً' });
    }

    await query(
      `INSERT INTO contact_messages (name, email, phone, subject, message, ip_address)
       VALUES ($1,$2,$3,$4,$5,$6)`,
      [name.trim(), email.trim().toLowerCase(), phone?.trim() || null, subject.trim(), message.trim(), clientIP]
    );
    // Notify all admins and support staff
    try {
      const adminsRes = await query("SELECT id FROM users WHERE role IN ('admin','superadmin') AND is_active=true");
      for (const admin of adminsRes.rows) {
        await query(
          `INSERT INTO notifications (user_id, type, title, message)
           VALUES ($1,'contact_message','رسالة تواصل جديدة',$2)`,
          [admin.id, `من: ${name.trim()} (${phone?.trim() || email.trim()}) - الموضوع: ${subject.trim()}`]
        );
      }
    } catch (notifyErr) {
      console.error('[contact notify]', notifyErr);
    }
    res.json({ success: true });
  } catch (err) {
    console.error('[contact]', err);
    res.status(500).json({ error: 'خطأ في إرسال الرسالة' });
  }
});

router.get('/', authenticate, requireAdmin, async (_req: AuthRequest, res: Response) => {
  try {
    const result = await query(
      'SELECT * FROM contact_messages ORDER BY created_at DESC'
    );
    res.json(result.rows);
  } catch {
    res.status(500).json({ error: 'خطأ' });
  }
});

router.patch('/:id/read', authenticate, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    await query('UPDATE contact_messages SET is_read=true WHERE id=$1', [req.params.id]);
    res.json({ success: true });
  } catch {
    res.status(500).json({ error: 'خطأ' });
  }
});

export default router;
