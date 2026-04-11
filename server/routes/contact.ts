import { Router, Request, Response } from 'express';
import { query } from '../db.js';
import { authenticate, requireAdmin, AuthRequest } from '../middleware/auth.js';

const router = Router();

async function ensureTable() {
  await query(`
    CREATE TABLE IF NOT EXISTS contact_messages (
      id SERIAL PRIMARY KEY,
      name VARCHAR(200) NOT NULL,
      email VARCHAR(200) NOT NULL,
      phone VARCHAR(30),
      subject VARCHAR(300) NOT NULL,
      message TEXT NOT NULL,
      is_read BOOLEAN DEFAULT false,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `);
}
ensureTable().catch(console.error);

router.post('/', async (req: Request, res: Response) => {
  try {
    const { name, email, phone, subject, message } = req.body;
    if (!name || !email || !subject || !message) {
      return res.status(400).json({ error: 'جميع الحقول المطلوبة يجب ملؤها' });
    }
    await query(
      `INSERT INTO contact_messages (name, email, phone, subject, message)
       VALUES ($1,$2,$3,$4,$5)`,
      [name.trim(), email.trim(), phone?.trim() || null, subject.trim(), message.trim()]
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
