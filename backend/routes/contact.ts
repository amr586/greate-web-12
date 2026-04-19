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

    const insertRes = await query(
      `INSERT INTO contact_messages (name, email, phone, subject, message, ip_address)
       VALUES ($1,$2,$3,$4,$5,$6) RETURNING id`,
      [name.trim(), email.trim().toLowerCase(), phone?.trim() || null, subject.trim(), message.trim(), clientIP]
    );
    const msgId = insertRes.rows[0]?.id;
    // Notify all admins, superadmins, and staff (property_manager, data_entry, support)
    try {
      const staffRes = await query(
        `SELECT id, role, sub_role FROM users
         WHERE (role IN ('admin','superadmin') OR sub_role IN ('property_manager','data_entry','support'))
         AND is_active=true`
      );
      for (const staff of staffRes.rows) {
        const base = staff.role === 'superadmin'
          ? '/superadmin'
          : ['property_manager', 'data_entry', 'support'].includes(staff.sub_role || '')
            ? '/sub-admin'
            : '/admin';
        const dashLink = `${base}?tab=contact&msgId=${msgId}`;
        await query(
          `INSERT INTO notifications (user_id, type, title, message, link)
           VALUES ($1,'contact_message','طلب تواصل جديد',$2,$3)`,
          [staff.id, `من: ${name.trim()} (${phone?.trim() || email.trim()}) - الموضوع: ${subject.trim()}`, dashLink]
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

function isStaffOrAdmin(user: AuthRequest['user']): boolean {
  if (!user) return false;
  if (user.role === 'admin' || user.role === 'superadmin') return true;
  if (['property_manager', 'data_entry', 'support'].includes(user.sub_role || '')) return true;
  return false;
}

router.get('/', authenticate, async (req: AuthRequest, res: Response) => {
  if (!isStaffOrAdmin(req.user)) return res.status(403).json({ error: 'غير مسموح' });
  try {
    const result = await query(`
      SELECT cm.*,
        u.id AS registered_user_id,
        u.name AS registered_name,
        u.phone AS registered_phone,
        u.role AS registered_role,
        u.sub_role AS registered_sub_role
      FROM contact_messages cm
      LEFT JOIN users u ON lower(u.email) = lower(cm.email)
      ORDER BY cm.created_at DESC
    `);
    res.json(result.rows);
  } catch {
    res.status(500).json({ error: 'خطأ' });
  }
});

router.patch('/:id/read', authenticate, async (req: AuthRequest, res: Response) => {
  if (!isStaffOrAdmin(req.user)) return res.status(403).json({ error: 'غير مسموح' });
  try {
    await query('UPDATE contact_messages SET is_read=true WHERE id=$1', [req.params.id]);
    res.json({ success: true });
  } catch {
    res.status(500).json({ error: 'خطأ' });
  }
});

export default router;
