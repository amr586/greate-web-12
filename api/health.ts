import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import mysql from 'mysql2/promise';

const app = express();

app.use(cors({
  origin: '*',
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));

// Health endpoint
app.get('/api/health', async (req, res) => {
  let dbStatus = 'not configured';
  try {
    if (process.env.DATABASE_URL) {
      const pool = mysql.createPool({
        uri: process.env.DATABASE_URL,
        waitForConnections: true,
        connectionLimit: 2
      });
      await pool.query('SELECT 1');
      await pool.end();
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

// Root
app.get('/api', (req, res) => {
  res.json({ ok: true, service: 'Great Society API', version: '1.0.0' });
});

// Cron endpoint
app.get('/api/cron', async (req, res) => {
  if (req.headers['x-vercel-cron'] !== 'true') {
    return res.status(403).json({ error: 'Forbidden' });
  }
  
  try {
    const pool = mysql.createPool({
      uri: process.env.DATABASE_URL,
      waitForConnections: true,
      connectionLimit: 2
    });
    
    await pool.execute(
      'DELETE FROM otp_codes WHERE created_at < DATE_SUB(NOW(), INTERVAL 24 HOUR) AND used = true'
    );
    
    await pool.end();
    
    res.json({ ok: true, message: 'Cron executed', timestamp: new Date().toISOString() });
  } catch (err: any) {
    res.status(500).json({ error: 'Cron failed', message: err.message });
  }
});

module.exports = app;
