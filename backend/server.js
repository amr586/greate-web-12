// server.js - ESM with ts-node-style loader
import 'tsx/register';

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '.env') });

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: process.env.NODE_ENV === 'production' ? 'https://greatsociety-eg.com' : '*',
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));

// Health endpoints
app.get('/api/health', (req, res) => {
  res.json({ ok: true, service: 'إسكنك API', db: process.env.DATABASE_URL ? 'connected' : 'disconnected' });
});

app.get('/', (req, res) => {
  res.json({ ok: true, service: 'Great Society API', version: '1.0.0', endpoints: '/api/*' });
});

// Import and use routes with dynamic import
async function loadRoutes() {
  const routeFiles = [
    { prefix: 'auth', file: './routes/auth.ts' },
    { prefix: 'properties', file: './routes/properties.ts' },
    { prefix: 'admin', file: './routes/admin.ts' },
    { prefix: 'ai-chat', file: './routes/ai-chat.ts' },
    { prefix: 'support', file: './routes/support.ts' },
    { prefix: 'payments', file: './routes/payments.ts' },
    { prefix: 'upload', file: './routes/upload.ts' },
    { prefix: 'notifications', file: './routes/notifications.ts' },
    { prefix: 'property-chat', file: './routes/property-chat.ts' },
    { prefix: 'contact', file: './routes/contact.ts' },
  ];

  for (const route of routeFiles) {
    try {
      const mod = await import(route.file);
      app.use(`/api/${route.prefix}`, mod.default || mod);
      console.log(`[ROUTE] /api/${route.prefix} loaded`);
    } catch (e) {
      console.log(`[ROUTE] ${route.prefix} failed:`, e.message);
    }
  }
}

// Also try loading from index.ts
async function tryLoadFromIndex() {
  try {
    const index = await import('./index.ts');
    console.log('[INDEX] Loaded from index.ts');
  } catch (e) {
    console.log('[INDEX] Could not load index.ts:', e.message);
  }
}

loadRoutes().then(() => {
  console.log('[SERVER] All routes loaded');
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🏠 API running on port ${PORT}`);
  });
}).catch(err => {
  console.error('[ERROR]:', err);
  process.exit(1);
});