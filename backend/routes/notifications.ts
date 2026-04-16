import { Router, Response } from 'express';
import { query } from '../db.js';
import { authenticate, AuthRequest } from '../middleware/auth.js';

const router = Router();

// Get notifications for current user (any role)
router.get('/mine', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const result = await query(
      `SELECT * FROM notifications WHERE user_id = $1 ORDER BY created_at DESC LIMIT 50`,
      [req.user!.id]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('[notifications] mine error:', error);
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
});

// Count unread for current user
router.get('/unread-count', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const result = await query(
      `SELECT COUNT(*) FROM notifications WHERE user_id = $1 AND is_read = false`,
      [req.user!.id]
    );
    res.json({ count: parseInt(result.rows[0].count) });
  } catch (error) {
    res.status(500).json({ error: 'Failed' });
  }
});

// Mark all as read for current user
router.patch('/mark-all-read', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    await query('UPDATE notifications SET is_read = true WHERE user_id = $1', [req.user!.id]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed' });
  }
});

// Mark single notification as read
router.patch('/mark-read/:id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    await query(
      'UPDATE notifications SET is_read = true WHERE id = $1 AND user_id = $2',
      [req.params.id, req.user?.id]
    );
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update notification' });
  }
});

// Get admin notifications (all admins see all)
router.get('/admin', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    if (req.user?.role !== 'admin' && req.user?.role !== 'superadmin') {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    const result = await query(
      `SELECT * FROM notifications WHERE user_id = $1 ORDER BY created_at DESC LIMIT 100`,
      [req.user.id]
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
});

// Send notification from admin to a specific user
router.post('/send-to-user', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    if (req.user?.role !== 'admin' && req.user?.role !== 'superadmin') {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    const { user_id, title, message, type, link } = req.body;
    await query(
      `INSERT INTO notifications (user_id, type, title, message, link) VALUES ($1,$2,$3,$4,$5)`,
      [user_id, type || 'admin_message', title, message, link || null]
    );
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to send notification' });
  }
});

// Internal: notify property added (called from properties route)
router.post('/notify-property-added', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { propertyData } = req.body;
    const userRes = await query('SELECT id, name, email, phone FROM users WHERE id = $1', [req.user?.id]);
    if (userRes.rows.length === 0) return res.status(404).json({ error: 'User not found' });
    const userData = userRes.rows[0];
    const adminsRes = await query("SELECT id FROM users WHERE role IN ('admin','superadmin')");
    for (const admin of adminsRes.rows) {
      await query(
        `INSERT INTO notifications (user_id, type, title, message, property_data, user_data)
         VALUES ($1,'property_added','عقار جديد يحتاج مراجعة',$2,$3,$4)`,
        [
          admin.id,
          `تم إضافة عقار جديد من المستخدم: ${userData.name} - ${userData.phone}`,
          JSON.stringify(propertyData),
          JSON.stringify(userData),
        ]
      );
    }
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed' });
  }
});

export default router;
