import mysql from 'mysql2/promise';

export default async function handler(req: any, res: any) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Max-Age', '86400');
  
  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }
  
  const { query, method, url } = req;
  
  // Build MySQL config from Vercel environment variables
  const dbConfig = {
    host: process.env.DB_HOST || 'srv2121.hstgr.io',
    user: process.env.DB_USER || 'u156204542_amr',
    password: process.env.DB_PASSWORD || 'Amrahmed01281378331',
    database: process.env.DB_NAME || 'u156204542_Dbase',
    port: parseInt(process.env.DB_PORT || '3306'),
    waitForConnections: true,
    connectionLimit: 2,
    queueLimit: 0
  };
  
  console.log('[DEBUG] DB config host:', dbConfig.host);
  console.log('[DEBUG] DB config user:', dbConfig.user);
  console.log('[DEBUG] DB config database:', dbConfig.database);
  
  let pool;
  try {
    pool = mysql.createPool(dbConfig);
    console.log('[DEBUG] Pool created');
  } catch (e: any) {
    console.log('[ERROR] Pool creation failed:', e.message);
    return res.status(500).json({ ok: false, error: 'Pool creation failed: ' + e.message });
  }
  
  // /api/health
  if (url?.includes('/api/health')) {
    let dbStatus = 'error';
    try {
      const conn = await pool.getConnection();
      await conn.ping();
      conn.release();
      dbStatus = 'connected';
      console.log('[DEBUG] Health OK');
    } catch (e: any) { 
      console.log('[ERROR] Health failed:', e.message);
      dbStatus = 'error: ' + e.message; 
    }
    await pool.end();
    return res.json({ ok: true, service: 'إسكنك API', db: dbStatus, timestamp: new Date().toISOString() });
  }
  
  // /api/properties
  if (method === 'GET' && url?.includes('/api/properties')) {
    try {
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
    } catch (err: any) { 
      console.log('[ERROR] Properties:', err.message);
      await pool.end();
      return res.status(500).json({ error: err.message }); 
    }
  }
  
  // /api/properties/:id
  if (method === 'GET' && url?.match(/\/api\/properties\/\d+/)) {
    try {
      const id = url.match(/\/api\/properties\/(\d+)/)?.[1];
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
    } catch (err: any) { 
      await pool.end();
      return res.status(500).json({ error: err.message }); 
    }
  }
  
  // /api/auth/login
  if (method === 'POST' && url?.includes('/api/auth/login')) {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        await pool.end();
        return res.status(400).json({ error: 'Email and password required' });
      }
      
      const [rows]: any = await pool.query('SELECT id, name, email, password_hash, role, sub_role FROM users WHERE email = ? AND is_active = true', [email]);
      
      if (!rows || rows.length === 0) {
        await pool.end();
        return res.status(401).json({ error: 'Invalid credentials' });
      }
      
      const user = rows[0];
      const bcrypt = await import('bcryptjs');
      const validPassword = await bcrypt.default.compare(password, user.password_hash);
      
      if (!validPassword) {
        await pool.end();
        return res.status(401).json({ error: 'Invalid credentials' });
      }
      
      const jwt = await import('jsonwebtoken');
      const token = jwt.default.sign(
        { id: user.id, role: user.role, sub_role: user.sub_role, email: user.email }, 
        process.env.JWT_SECRET || 'f6b6104a80af41be3d7660d251867a2793a60dd4f664784f1f62dda2c47542a6d47bab11919c736a9757c9f4790e44b2d3e3438bdd3afe9a3b4b69a2f8eb78c3', 
        { expiresIn: '7d' }
      );
      
      await pool.end();
      return res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role, sub_role: user.sub_role } });
    } catch (err: any) { 
      console.log('[ERROR] Login:', err.message);
      await pool.end();
      return res.status(500).json({ error: 'Login failed', message: err.message }); 
    }
  }
  
  await pool.end();
  return res.json({ ok: true, service: 'Great Society API' });
}
