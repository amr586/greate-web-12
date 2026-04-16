import mysql from 'mysql2/promise';

export default async function handler(req: any, res: any) {
  const { query, method, url } = req;
  
  // Get database URL - try multiple env var names
  let dbConfig: any = null;
  
  // Option 1: DATABASE_URL as full URI
  if (process.env.DATABASE_URL) {
    dbConfig = { uri: process.env.DATABASE_URL };
  }
  // Option 2: Build from individual parts
  else if (process.env.DB_HOST) {
    const user = process.env.DB_USER || process.env.DB_USERNAME || 'u156204542_amr';
    const pass = process.env.DB_PASSWORD || 'Amrahmed01281378331';
    const host = process.env.DB_HOST || 'srv2121.hstgr.io';
    const port = process.env.DB_PORT || '3306';
    const name = process.env.DB_NAME || 'u156204542_Dbase';
    dbConfig = { 
      host, 
      user, 
      password: pass, 
      database: name,
      port: parseInt(port)
    };
  }
  
  console.log('[DEBUG] DB config:', dbConfig ? (dbConfig.uri ? 'using URI' : 'using config') : 'NULL');
  
  if (!dbConfig) {
    return res.json({ ok: false, error: 'No database configuration' });
  }
  
  // /api/health
  if (url?.includes('/api/health')) {
    let dbStatus = 'not configured';
    try {
      const pool = mysql.createPool({ ...dbConfig, waitForConnections: true, connectionLimit: 2 });
      await pool.query('SELECT 1');
      await pool.end();
      dbStatus = 'connected';
    } catch (e: any) { dbStatus = 'error: ' + e.message; }
    return res.json({ ok: true, service: 'إسكنك API', db: dbStatus, timestamp: new Date().toISOString() });
  }
  
  // /api/cron
  if (url?.includes('/api/cron')) {
    if (req.headers['x-vercel-cron'] !== 'true') return res.status(403).json({ error: 'Forbidden' });
    try {
      const pool = mysql.createPool({ ...dbConfig, waitForConnections: true, connectionLimit: 2 });
      await pool.execute('DELETE FROM otp_codes WHERE created_at < DATE_SUB(NOW(), INTERVAL 24 HOUR) AND used = true');
      await pool.end();
      return res.json({ ok: true, message: 'Cron executed' });
    } catch (err: any) { return res.status(500).json({ error: err.message }); }
  }
  
  // /api/auth/login
  if (method === 'POST' && url?.includes('/api/auth/login')) {
    try {
      const { email, password } = req.body;
      if (!email || !password) return res.status(400).json({ error: 'Email and password required' });
      
      const pool = mysql.createPool({ ...dbConfig, waitForConnections: true, connectionLimit: 2 });
      const [rows]: any = await pool.query('SELECT id, name, email, password_hash, role, sub_role FROM users WHERE email = ? AND is_active = true', [email]);
      if (!rows || rows.length === 0) { await pool.end(); return res.status(401).json({ error: 'Invalid credentials' }); }
      
      const user = rows[0];
      const bcrypt = await import('bcryptjs');
      const validPassword = await bcrypt.default.compare(password, user.password_hash);
      if (!validPassword) { await pool.end(); return res.status(401).json({ error: 'Invalid credentials' }); }
      
      const jwt = await import('jsonwebtoken');
      const token = jwt.default.sign({ id: user.id, role: user.role, sub_role: user.sub_role, email: user.email }, process.env.JWT_SECRET || 'secret', { expiresIn: '7d' });
      await pool.end();
      
      return res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role, sub_role: user.sub_role } });
    } catch (err: any) { return res.status(500).json({ error: err.message }); }
  }
  
  // /api/properties
  if (method === 'GET' && url?.includes('/api/properties')) {
    try {
      const pool = mysql.createPool({ ...dbConfig, waitForConnections: true, connectionLimit: 2 });
      const limit = parseInt(query.limit as string) || 50;
      
      const [rows]: any = await pool.query(`
        SELECT p.*, u.name as owner_name 
        FROM properties p 
        LEFT JOIN users u ON u.id = p.owner_id 
        WHERE p.status = 'approved' 
        ORDER BY p.created_at DESC 
        LIMIT ?
      `, [limit]);
      
      for (const prop of rows) {
        const [images]: any = await pool.query('SELECT * FROM property_images WHERE property_id = ?', [prop.id]);
        prop.images = images;
      }
      
      await pool.end();
      return res.json(rows);
    } catch (err: any) { return res.status(500).json({ error: err.message }); }
  }
  
  // /api/properties/:id
  if (method === 'GET' && url?.match(/\/api\/properties\/\d+/)) {
    try {
      const id = url.match(/\/api\/properties\/(\d+)/)?.[1];
      const pool = mysql.createPool({ ...dbConfig, waitForConnections: true, connectionLimit: 2 });
      
      const [rows]: any = await pool.query(`
        SELECT p.*, u.name as owner_name, u.phone as owner_phone, u.email as owner_email
        FROM properties p LEFT JOIN users u ON u.id = p.owner_id WHERE p.id = ?
      `, [id]);
      
      if (rows.length > 0) {
        const [images]: any = await pool.query('SELECT * FROM property_images WHERE property_id = ?', [id]);
        rows[0].images = images;
      }
      
      await pool.end();
      return res.json(rows[0] || { error: 'Not found' });
    } catch (err: any) { return res.status(500).json({ error: err.message }); }
  }
  
  return res.json({ ok: true, service: 'Great Society API', version: '1.0.0' });
}
