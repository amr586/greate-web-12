import mysql from 'mysql2/promise';

export default async function handler(req: any, res: any) {
  const { query } = req;
  
  // /api/health
  if (query.msg === 'health' || req.url?.includes('/api/health')) {
    let dbStatus = 'not configured';
    try {
      const dbUrl = process.env.DATABASE_URL || process.env.MYSQL_URL;
      console.log('[DEBUG] DATABASE_URL:', dbUrl ? 'set (' + (dbUrl?.substring(0, 20) + '...') + ')' : 'NOT SET');
      if (dbUrl) {
        const pool = mysql.createPool({
          uri: dbUrl,
          waitForConnections: true,
          connectionLimit: 2
        });
        await pool.query('SELECT 1');
        await pool.end();
        dbStatus = 'connected';
      }
    } catch (e: any) {
      dbStatus = 'error: ' + (e.message || 'unknown');
    }
    return res.json({ 
      ok: true, 
      service: 'إسكنك API', 
      db: dbStatus,
      timestamp: new Date().toISOString()
    });
  }
  
  // /api/cron
  if (req.url?.includes('/api/cron')) {
    if (req.headers['x-vercel-cron'] !== 'true') {
      return res.status(403).json({ error: 'Forbidden' });
    }
    
    try {
      const pool = mysql.createPool({
        uri: process.env.DATABASE_URL as string,
        waitForConnections: true,
        connectionLimit: 2
      });
      
      await pool.execute(
        'DELETE FROM otp_codes WHERE created_at < DATE_SUB(NOW(), INTERVAL 24 HOUR) AND used = true'
      );
      
      await pool.end();
      
      return res.json({ ok: true, message: 'Cron executed', timestamp: new Date().toISOString() });
    } catch (err: any) {
      return res.status(500).json({ error: 'Cron failed', message: err.message });
    }
  }
  
  // /api/login
  if (req.method === 'POST' && req.url?.includes('/api/auth/login')) {
    try {
      const { email, password } = req.body;
      
      if (!email || !password) {
        return res.status(400).json({ error: 'Email and password required' });
      }
      
      const pool = mysql.createPool({
        uri: process.env.DATABASE_URL as string,
        waitForConnections: true,
        connectionLimit: 2
      });
      
      const bcrypt = await import('bcryptjs');
      const jwt = await import('jsonwebtoken');
      
      const [rows]: any = await pool.query(
        'SELECT id, name, email, password_hash, role, sub_role FROM users WHERE email = ? AND is_active = true',
        [email]
      );
      
      if (!rows || rows.length === 0) {
        await pool.end();
        return res.status(401).json({ error: 'Invalid credentials' });
      }
      
      const user = rows[0];
      const validPassword = await bcrypt.default.compare(password, user.password_hash);
      
      if (!validPassword) {
        await pool.end();
        return res.status(401).json({ error: 'Invalid credentials' });
      }
      
      const token = jwt.default.sign(
        { id: user.id, role: user.role, sub_role: user.sub_role, email: user.email },
        process.env.JWT_SECRET || 'secret',
        { expiresIn: '7d' }
      );
      
      await pool.end();
      
      return res.json({
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          sub_role: user.sub_role
        }
      });
    } catch (err: any) {
      console.error('Login error:', err.message);
      return res.status(500).json({ error: 'Login failed', message: err.message });
    }
  }
  
  // Default
  return res.json({ 
    ok: true, 
    service: 'Great Society API', 
    version: '1.0.0',
    endpoints: ['/api/health', '/api/auth/login']
  });
}
