import { Router, Response } from 'express';
import { query } from '../db.js';
import { authenticate, AuthRequest } from '../middleware/auth.js';

const router = Router();

function isAdminOrSupport(req: AuthRequest) {
  return ['admin', 'superadmin'].includes(req.user!.role) || req.user!.sub_role === 'support';
}

router.post('/tickets', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { subject } = req.body;
    const result = await query(
      "INSERT INTO support_tickets (user_id, subject, status) VALUES ($1,$2,'open') RETURNING *",
      [req.user!.id, subject]
    );
    res.status(201).json(result.rows[0]);
  } catch {
    res.status(500).json({ error: 'خطأ' });
  }
});

router.get('/tickets', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    let result;
    if (isAdminOrSupport(req)) {
      result = await query(`
        SELECT st.*, u.name as user_name, u.phone as user_phone, u.email as user_email
        FROM support_tickets st JOIN users u ON u.id = st.user_id ORDER BY st.created_at DESC
      `);
    } else {
      result = await query('SELECT * FROM support_tickets WHERE user_id=$1 ORDER BY created_at DESC', [req.user!.id]);
    }
    res.json(result.rows);
  } catch {
    res.status(500).json({ error: 'خطأ' });
  }
});

router.get('/tickets/:id/messages', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const result = await query(`
      SELECT sm.*, u.name as sender_name, u.role as sender_role, u.sub_role as sender_sub_role
      FROM support_messages sm JOIN users u ON u.id = sm.sender_id
      WHERE sm.ticket_id = $1 ORDER BY sm.created_at ASC
    `, [req.params.id]);
    res.json(result.rows);
  } catch {
    res.status(500).json({ error: 'خطأ' });
  }
});

router.post('/tickets/:id/messages', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { content } = req.body;
    const result = await query(
      'INSERT INTO support_messages (ticket_id, sender_id, content, is_admin) VALUES ($1,$2,$3,$4) RETURNING *',
      [req.params.id, req.user!.id, content, isAdminOrSupport(req)]
    );
    await query('UPDATE support_tickets SET updated_at=NOW() WHERE id=$1', [req.params.id]);
    res.status(201).json(result.rows[0]);
  } catch {
    res.status(500).json({ error: 'خطأ' });
  }
});

router.patch('/tickets/:id/close', authenticate, async (req: AuthRequest, res: Response) => {
  if (!isAdminOrSupport(req)) return res.status(403).json({ error: 'غير مسموح' });
  try {
    await query("UPDATE support_tickets SET status='closed' WHERE id=$1", [req.params.id]);
    res.json({ success: true });
  } catch {
    res.status(500).json({ error: 'خطأ' });
  }
});

export default router;
