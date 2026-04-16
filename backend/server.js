// server.js - Pure JavaScript, no TypeScript
const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: '*',
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));

// Simple health endpoint - works immediately
app.get('/api/health', (req, res) => {
  res.json({ 
    ok: true, 
    service: 'إسكنك API', 
    db: process.env.DATABASE_URL ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString()
  });
});

app.get('/', (req, res) => {
  res.json({ 
    ok: true, 
    service: 'Great Society API', 
    version: '1.0.0',
    endpoints: ['/api/health', '/api/auth/login', '/api/properties', '/api/admin/*']
  });
});

// Import routes dynamically
async function loadRoutes() {
  const routes = [
    { name: 'auth', file: './routes/auth.ts' },
    { name: 'properties', file: './routes/properties.ts' },
    { name: 'admin', file: './routes/admin.ts' },
  ];
  
  for (const route of routes) {
    try {
      const mod = await import(route.file);
      app.use(`/api/${route.name}`, mod.default);
      console.log(`✓ Loaded /api/${route.name}`);
    } catch (err) {
      console.log(`✗ Failed /api/${route.name}: ${err.message}`);
    }
  }
}

// Start server
loadRoutes().then(() => {
  console.log(`🏠 Server running on port ${PORT}`);
  app.listen(PORT, '0.0.0.0');
}).catch(err => {
  console.error('Error:', err);
  // Still start even if routes fail
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🏠 Server running on port ${PORT} (some routes may not loaded)`);
  });
});