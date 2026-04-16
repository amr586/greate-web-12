import 'dotenv/config';
import express from 'express';

const app = express();

app.get('/api/cron', async (req, res) => {
  if (req.headers['x-vercel-cron'] !== 'true') {
    return res.status(403).json({ error: 'Forbidden' });
  }
  
  try {
    const mysql = await import('mysql2/promise');
    
    const pool = mysql.createPool({
      uri: process.env.DATABASE_URL,
      waitForConnections: true,
      connectionLimit: 5
    });
    
    // Clean old OTP codes
    await pool.execute(
      'DELETE FROM otp_codes WHERE created_at < DATE_SUB(NOW(), INTERVAL 24 HOUR) AND used = true'
    );
    
    await pool.end();
    
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

// Health check
app.get('/api/health', async (req, res) => {
  res.json({ ok: true, timestamp: new Date().toISOString() });
});

module.exports = app;
