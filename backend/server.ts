// server.ts - Great Society API with frontend static serving
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { query } from './db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3001;
const isProd = process.env.NODE_ENV === 'production';
const frontendPath = path.join(__dirname, '..', 'dist');

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

// Dynamic route loader
async function loadRoutes() {
  const routes = [
    { name: 'auth', path: './routes/auth.js' },
    { name: 'properties', path: './routes/properties.js' },
    { name: 'admin', path: './routes/admin.js' },
    { name: 'ai-chat', path: './routes/ai-chat.js' },
    { name: 'support', path: './routes/support.js' },
    { name: 'payments', path: './routes/payments.js' },
    { name: 'upload', path: './routes/upload.js' },
    { name: 'notifications', path: './routes/notifications.js' },
    { name: 'property-chat', path: './routes/property-chat.js' },
    { name: 'contact', path: './routes/contact.js' }
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
