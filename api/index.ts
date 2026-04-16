import mysql from 'mysql2/promise';

export default async function handler(req: any, res: any) {
  const { query, method } = req;
  const dbUrl = process.env.DATABASE_URL || process.env.MYSQL_URL;
  
  // /api/health
  if (query.msg === 'health' || req.url?.includes('/api/health')) {
    let dbStatus = 'not configured';
    try {
      if (dbUrl) {
        const pool = mysql.createPool({ uri: dbUrl, waitForConnections: true, connectionLimit: 2 });
        await pool.query('SELECT 1');
        await pool.end();
        dbStatus = 'connected';
      }
    } catch (e: any) { dbStatus = 'error: ' + e.message; }
    return res.json({ ok: true, service: 'إسكنك API', db: dbStatus, timestamp: new Date().toISOString() });
  }
  
  // /api/cron
  if (req.url?.includes('/api/cron')) {
    if (req.headers['x-vercel-cron'] !== 'true') return res.status(403).json({ error: 'Forbidden' });
    try {
      const pool = mysql.createPool({ uri: dbUrl, waitForConnections: true, connectionLimit: 2 });
      await pool.execute('DELETE FROM otp_codes WHERE created_at < DATE_SUB(NOW(), INTERVAL 24 HOUR) AND used = true');
      await pool.end();
      return res.json({ ok: true, message: 'Cron executed', timestamp: new Date().toISOString() });
    } catch (err: any) { return res.status(500).json({ error: 'Cron failed', message: err.message }); }
  }
  
  // /api/auth/login
  if (method === 'POST' && req.url?.includes('/api/auth/login')) {
    try {
      const { email, password } = req.body;
      if (!email || !password) return res.status(400).json({ error: 'Email and password required' });
      
      const pool = mysql.createPool({ uri: dbUrl, waitForConnections: true, connectionLimit: 2 });
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
    } catch (err: any) { return res.status(500).json({ error: 'Login failed', message: err.message }); }
  }
  
  // /api/properties (GET all properties)
  if (method === 'GET' && req.url?.includes('/api/properties')) {
    try {
      const pool = mysql.createPool({ uri: dbUrl, waitForConnections: true, connectionLimit: 2 });
      const limit = parseInt(query.limit as string) || 50;
      
      const [rows]: any = await pool.query(`
        SELECT p.*, u.name as owner_name 
        FROM properties p 
        LEFT JOIN users u ON u.id = p.owner_id 
        WHERE p.status = 'approved' 
        ORDER BY p.created_at DESC 
        LIMIT ?
      `, [limit]);
      
      // Get images for each property
      for (const prop of rows) {
        const [images]: any = await pool.query('SELECT * FROM property_images WHERE property_id = ? ORDER BY order_index, id', [prop.id]);
        prop.images = images;
      }
      
      await pool.end();
      return res.json(rows);
    } catch (err: any) { return res.status(500).json({ error: err.message }); }
  }
  
  // /api/properties/:id (GET single property)
  if (method === 'GET' && req.url?.match(/\/api\/properties\/\d+/)) {
    try {
      const id = req.url.match(/\/api\/properties\/(\d+)/)?.[1];
      const pool = mysql.createPool({ uri: dbUrl, waitForConnections: true, connectionLimit: 2 });
      
      const [rows]: any = await pool.query(`
        SELECT p.*, u.name as owner_name, u.phone as owner_phone, u.email as owner_email
        FROM properties p 
        LEFT JOIN users u ON u.id = p.owner_id 
        WHERE p.id = ?
      `, [id]);
      
      if (rows.length > 0) {
        const [images]: any = await pool.query('SELECT * FROM property_images WHERE property_id = ? ORDER BY order_index, id', [id]);
        rows[0].images = images;
      }
      
      await pool.end();
      return res.json(rows[0] || { error: 'Not found' });
    } catch (err: any) { return res.status(500).json({ error: err.message }); }
  }
  
  // Default
  return res.json({ ok: true, service: 'Great Society API', version: '1.0.0', endpoints: ['/api/health', '/api/auth/login', '/api/properties'] });
}
