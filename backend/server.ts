// server.ts - Great Society API with frontend static serving
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { query } from './db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3001;
const isProd = process.env.NODE_ENV === 'production';
const frontendPath = path.join(__dirname, '..', 'dist');

// Ensure uploads directory exists and serve it statically
const uploadsDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
app.use('/uploads', express.static(uploadsDir));

// Middleware
app.use(cors({
  origin: isProd ? 'https://greatsociety-eg.com' : '*',
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));

// Health endpoint
app.get('/api/health', async (req, res) => {
  let dbStatus = 'not configured';
  try {
    if (process.env.DATABASE_URL) {
      await query('SELECT 1');
      dbStatus = 'connected';
    }
  } catch (e) {
    dbStatus = 'error';
  }
  res.json({ 
    ok: true, 
    service: 'إسكنك API', 
    db: dbStatus,
    timestamp: new Date().toISOString()
  });
});

// Root API info
app.get('/api', (req, res) => {
  res.json({ 
    ok: true, 
    service: 'Great Society API', 
    version: '1.0.0',
    endpoints: ['/api/health', '/api/auth', '/api/properties', '/api/admin']
  });
});

// Cron job endpoint (runs daily at 5 AM UTC)
app.get('/api/cron', async (req, res) => {
  if (req.headers['x-vercel-cron'] !== 'true') {
    return res.status(403).json({ error: 'Forbidden' });
  }
  
  try {
    console.log('[CRON] Running scheduled tasks...');
    
    // Example: Clean old OTP codes older than 24 hours
    const deletedOtp = await query(
      'DELETE FROM otp_codes WHERE created_at < DATE_SUB(NOW(), INTERVAL 24 HOUR) AND used = true'
    );
    
    console.log('[CRON] Old OTP codes cleaned');
    
    res.json({ 
      ok: true, 
      message: 'Cron executed successfully',
      timestamp: new Date().toISOString()
    });
  } catch (err: any) {
    console.error('[CRON] Error:', err.message);
    res.status(500).json({ error: 'Cron failed', message: err.message });
  }
});

// Dynamic route loader
async function loadRoutes() {
  const routes = [
    { name: 'auth', path: './routes/auth.ts' },
    { name: 'properties', path: './routes/properties.ts' },
    { name: 'admin', path: './routes/admin.ts' },
    { name: 'ai-chat', path: './routes/ai-chat.ts' },
    { name: 'support', path: './routes/support.ts' },
    { name: 'payments', path: './routes/payments.ts' },
    { name: 'upload', path: './routes/upload.ts' },
    { name: 'notifications', path: './routes/notifications.ts' },
    { name: 'property-chat', path: './routes/property-chat.ts' },
    { name: 'contact', path: './routes/contact.ts' },
    { name: 'settings', path: './routes/settings.ts' }
  ];
  
  for (const route of routes) {
    try {
      const mod = await import(route.path);
      app.use(`/api/${route.name}`, mod.default || mod);
      console.log(`✓ Loaded /api/${route.name}`);
    } catch (err) {
      console.log(`✗ /api/${route.name}: ${err.message}`);
    }
  }
}

// Serve static frontend in production
if (isProd) {
  app.use(express.static(frontendPath));
  console.log(`📁 Serving frontend from: ${frontendPath}`);
  
  // Fallback to index.html for SPA routing
  app.get('*', (req, res) => {
    res.sendFile(path.join(frontendPath, 'index.html'));
  });
}

loadRoutes().then(() => {
  console.log('All routes loaded');
  
  // Vercel serverless function export
  if (process.env.VERCEL === '1') {
    module.exports = app;
  } else {
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`   API: http://localhost:${PORT}/api`);
      if (isProd) {
        console.log(`   Frontend: http://localhost:${PORT}`);
      }
    });
  }
});
