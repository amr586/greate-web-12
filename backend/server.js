require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;

// Dynamic route loading
const loadRoutes = async () => {
  const routes = ['auth', 'properties', 'admin', 'ai-chat', 'support', 'payments', 'upload', 'notifications', 'property-chat', 'contact'];
  
  for (const route of routes) {
    try {
      const router = await import(`./routes/${route}.js`);
      app.use(`/api/${route}`, router.default || router);
    } catch (e) {
      console.log(`[ROUTE] ${route} not loaded:`, e.message);
    }
  }
};

app.use(cors({
  origin: process.env.NODE_ENV === 'production' ? 'https://greatsociety-eg.com' : '*',
  credentials: true,
}));

app.use(express.json({ limit: '10mb' }));

app.get('/api/health', (req, res) => {
  res.json({ ok: true, service: 'إسكنك API', db: process.env.DATABASE_URL ? 'connected' : 'disconnected' });
});

app.get('/', (req, res) => {
  res.json({ ok: true, service: 'Great Society API', version: '1.0.0', endpoints: '/api/*' });
});

loadRoutes().then(() => {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🏠 إسكنك API running on port ${PORT}`);
  });
}).catch(err => {
  console.error('[SERVER] Fatal error:', err);
  process.exit(1);
});