import { Router, Response } from 'express';
import { query } from '../db.js';
import { authenticate, AuthRequest } from '../middleware/auth.js';

const router = Router();

const DEFAULT_SETTINGS: Record<string, string> = {
  logo_url: '/logo_gs.png',
  company_name: 'GREAT SOCIETY',
  company_tagline: 'REALESTATE & CONSTRUCTION',
  phone: '01100111618',
  whatsapp: '201100111618',
  email: 'greatsociety6@gmail.com',
  location: 'Villa 99, 1st District, 90 Street, New Cairo 1, Cairo',
  location_url: 'https://www.google.com/maps/search/Villa+99+1st+District+90+street,+New+Cairo+1,+Cairo,+Egypt',
  working_hours: 'السبت - الخميس: 9ص - 9م',
  footer_description: 'شركة Great Society للاستثمار العقاري - شركة مصرية متخصصة في تقديم خدمات عقارية شاملة في مجالات متعددة',
  ai_instructions: '',
  ai_faq: '[]',
};

async function ensureTable() {
  await query(`
    CREATE TABLE IF NOT EXISTS site_settings (
      key VARCHAR(100) PRIMARY KEY,
      value TEXT NOT NULL,
      updated_at TIMESTAMPTZ DEFAULT NOW()
    )
  `);
  for (const [key, value] of Object.entries(DEFAULT_SETTINGS)) {
    await query(
      `INSERT INTO site_settings (key, value) VALUES ($1, $2) ON CONFLICT (key) DO NOTHING`,
      [key, value]
    );
  }
}
ensureTable().catch(console.error);

router.get('/', async (_req, res: Response) => {
  try {
    const result = await query('SELECT key, value FROM site_settings');
    const settings: Record<string, string> = { ...DEFAULT_SETTINGS };
    for (const row of result.rows) {
      settings[row.key] = row.value;
    }
    res.json(settings);
  } catch (err) {
    console.error('[settings GET]', err);
    res.json(DEFAULT_SETTINGS);
  }
});

router.patch('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    if (req.user?.role !== 'superadmin') {
      return res.status(403).json({ error: 'غير مصرح' });
    }
    const updates = req.body as Record<string, string>;
    for (const [key, value] of Object.entries(updates)) {
      if (typeof value !== 'string') continue;
      await query(
        `INSERT INTO site_settings (key, value, updated_at)
         VALUES ($1, $2, NOW())
         ON CONFLICT (key) DO UPDATE SET value = $2, updated_at = NOW()`,
        [key, value]
      );
    }
    const result = await query('SELECT key, value FROM site_settings');
    const settings: Record<string, string> = { ...DEFAULT_SETTINGS };
    for (const row of result.rows) {
      settings[row.key] = row.value;
    }
    res.json(settings);
  } catch (err) {
    console.error('[settings PATCH]', err);
    res.status(500).json({ error: 'خطأ في تحديث الإعدادات' });
  }
});

export default router;
