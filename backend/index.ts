import 'dotenv/config';
import bcrypt from 'bcryptjs';
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import authRouter from './routes/auth.js';
import propertiesRouter from './routes/properties.js';
import adminRouter from './routes/admin.js';
import aiChatRouter from './routes/ai-chat.js';
import supportRouter from './routes/support.js';
import paymentsRouter from './routes/payments.js';
import uploadRouter from './routes/upload.js';
import notificationsRouter from './routes/notifications.js';
import propertyChatRouter from './routes/property-chat.js';
import contactRouter from './routes/contact.js';
import runMigrations from './mysql-migrations.js';

async function main() {
  try {
    console.log('[SERVER] Starting Great Society API...');
    console.log('[SERVER] NODE_ENV:', process.env.NODE_ENV);
    console.log('[SERVER] DATABASE_URL:', process.env.DATABASE_URL ? 'set' : 'NOT SET');
    
    // Run migrations
    await runMigrations();
    
    const __dirname = path.dirname(fileURLToPath(import.meta.url));
    const app = express();
    const PORT = Number(process.env.PORT) || 3001;
    const isProd = process.env.NODE_ENV === 'production';
    const projectRoot = path.join(__dirname, '..');

    console.log('[SERVER] isProd:', isProd);
    console.log('[SERVER] projectRoot:', projectRoot);

    app.use(cors({
      origin: process.env.NODE_ENV === 'production' ? 'https://greatsociety-eg.com' : '*',
      credentials: true,
    }));
    app.use(express.json({ limit: '10mb' }));

    app.use('/api/auth', authRouter);
    app.use('/api/properties', propertiesRouter);
    app.use('/api/admin', adminRouter);
    app.use('/api/ai', aiChatRouter);
    app.use('/api/support', supportRouter);
    app.use('/api/payments', paymentsRouter);
    app.use('/api/upload', uploadRouter);
    app.use('/api/notifications', notificationsRouter);
    app.use('/api/property-chat', propertyChatRouter);
    app.use('/api/contact', contactRouter);

    app.use('/uploads', express.static(path.join(projectRoot, 'uploads')));

    app.get('/api/health', (_req, res) => res.json({ ok: true, service: 'إسكنك API', db: process.env.DATABASE_URL ? 'connected' : 'disconnected' }));

    app.get('/', (_req, res) => {
      res.json({ ok: true, service: 'Great Society API', version: '1.0.0', endpoints: '/api/*', note: 'Backend only - Frontend at https://greatsociety-eg.com' });
    });

    app.listen(PORT, '0.0.0.0', () => {
      console.log(`🏠 إسكنك API running on port ${PORT}`);
      console.log(`📍 Backend: https://backend.greatsociety-eg.com`);
    });
  } catch (err) {
    console.error('[SERVER] Fatal error:', err);
    process.exit(1);
  }
}

main();
