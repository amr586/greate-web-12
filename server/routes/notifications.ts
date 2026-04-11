import { Router, Response } from 'express';
import { query } from '../db.js';
import { authenticate, AuthRequest } from '../middleware/auth.js';
import nodemailer from 'nodemailer';

const router = Router();

// Email transporter setup (configure with your email service)
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.NOTIFICATION_EMAIL || 'your-email@gmail.com',
    pass: process.env.NOTIFICATION_EMAIL_PASSWORD || 'your-app-password',
  },
});

// Store notification for admin dashboard
async function createAdminNotification(
  userId: number,
  propertyData: any,
  userData: any
) {
  try {
    // Get all admin emails
    const adminsRes = await query('SELECT id FROM users WHERE role = $1', ['admin']);
    
    for (const admin of adminsRes.rows) {
      await query(
        `INSERT INTO notifications (user_id, type, title, message, property_data, user_data)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [
          admin.id,
          'property_added',
          'عقار جديد تم إضافته',
          `تم إضافة عقار جديد من المستخدم: ${userData.name} - ${userData.email}`,
          JSON.stringify(propertyData),
          JSON.stringify(userData),
        ]
      );
    }

    console.log('[v0] Admin notifications created successfully');
  } catch (error) {
    console.error('[v0] Error creating admin notifications:', error);
  }
}

// Send email notification to admins
async function sendAdminEmails(propertyData: any, userData: any) {
  try {
    const adminEmailsRes = await query(
      'SELECT email FROM admin_emails WHERE is_active = true'
    );

    if (adminEmailsRes.rows.length === 0) {
      console.log('[v0] No admin emails configured');
      return;
    }

    const emailList = adminEmailsRes.rows.map(row => row.email).join(',');

    const emailContent = `
      <h2>تنبيه: عقار جديد تم إضافته</h2>
      <hr />
      <h3>معلومات المستخدم:</h3>
      <ul>
        <li><strong>الاسم:</strong> ${userData.name}</li>
        <li><strong>البريد الإلكتروني:</strong> ${userData.email}</li>
        <li><strong>رقم الهاتف:</strong> ${userData.phone}</li>
      </ul>
      
      <h3>معلومات العقار:</h3>
      <ul>
        <li><strong>العنوان:</strong> ${propertyData.title}</li>
        <li><strong>النوع:</strong> ${propertyData.type}</li>
        <li><strong>الغرض:</strong> ${propertyData.purpose === 'sale' ? 'بيع' : 'إيجار'}</li>
        <li><strong>السعر:</strong> ${propertyData.price} جنيه</li>
        <li><strong>المساحة:</strong> ${propertyData.area} م²</li>
        <li><strong>عدد الغرف:</strong> ${propertyData.bedrooms}</li>
        <li><strong>عدد الحمامات:</strong> ${propertyData.bathrooms}</li>
        <li><strong>الموقع:</strong> ${propertyData.district}</li>
        <li><strong>الوصف:</strong> ${propertyData.description}</li>
      </ul>
      
      <hr />
      <p><a href="${process.env.APP_URL || 'http://localhost:5000'}/admin/properties">اضغط هنا لمراجعة العقار</a></p>
    `;

    await transporter.sendMail({
      from: process.env.NOTIFICATION_EMAIL || 'your-email@gmail.com',
      to: emailList,
      subject: `تنبيه جديد: تم إضافة عقار جديد - ${propertyData.title}`,
      html: emailContent,
    });

    console.log('[v0] Admin emails sent successfully');
  } catch (error) {
    console.error('[v0] Error sending admin emails:', error);
  }
}

// Notify admin when property is added
router.post('/notify-property-added', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { propertyData } = req.body;

    // Get user info
    const userRes = await query('SELECT id, name, email, phone FROM users WHERE id = $1', [req.user?.id]);
    if (userRes.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const userData = userRes.rows[0];

    // Create dashboard notification
    await createAdminNotification(req.user!.id, propertyData, userData);

    // Send email notifications
    await sendAdminEmails(propertyData, userData);

    res.json({ success: true, message: 'Admins notified' });
  } catch (error) {
    console.error('[v0] Notification error:', error);
    res.status(500).json({ error: 'Failed to send notifications' });
  }
});

// Get admin notifications - show all to any admin
router.get('/admin', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    if (req.user?.role !== 'admin' && req.user?.role !== 'superadmin') {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const notificationsRes = await query(
      `SELECT * FROM notifications ORDER BY created_at DESC LIMIT 100`
    );

    res.json(notificationsRes.rows);
  } catch (error) {
    console.error('[v0] Get notifications error:', error);
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
});

// Mark notification as read
router.patch('/mark-read/:id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    await query(
      'UPDATE notifications SET is_read = true WHERE id = $1 AND user_id = $2',
      [req.params.id, req.user?.id]
    );

    res.json({ success: true });
  } catch (error) {
    console.error('[v0] Mark read error:', error);
    res.status(500).json({ error: 'Failed to update notification' });
  }
});

// Setup admin email
router.post('/setup-admin-email', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    if (req.user?.role !== 'superadmin') {
      return res.status(403).json({ error: 'Only superadmin can setup admin emails' });
    }

    const { email } = req.body;

    await query(
      `INSERT INTO admin_emails (email) VALUES ($1)
       ON CONFLICT (email) DO UPDATE SET is_active = true`,
      [email]
    );

    res.json({ success: true, message: 'Admin email configured' });
  } catch (error) {
    console.error('[v0] Setup admin email error:', error);
    res.status(500).json({ error: 'Failed to setup admin email' });
  }
});

export default router;
