import mysql from 'mysql2/promise';

export default async function handler(req: any, res: any) {
  const { query, method, url } = req;
  
  // Force local MySQL config (same as local development)
  const dbConfig = {
    host: 'srv2121.hstgr.io',
    user: 'u156204542_amr',
    password: 'Amrahmed01281378331',
    database: 'u156204542_Dbase',
    port: 3306,
    waitForConnections: true,
    connectionLimit: 2
  };
  
  console.log('[DEBUG] Using direct config for srv2121.hstgr.io');
  
  // /api/health
  if (url?.includes('/api/health')) {
    let dbStatus = 'not configured';
    try {
      const pool = mysql.createPool(dbConfig);
      await pool.query('SELECT 1');
      await pool.end();
      dbStatus = 'connected';
    } catch (e: any) { 
      console.log('[DEBUG] DB error:', e.message);
      dbStatus = 'error: ' + e.message; 
    }
    return res.json({ ok: true, service: 'إسكنك API', db: dbStatus, timestamp: new Date().toISOString() });
  }
  
  // /api/properties
  if (method === 'GET' && url?.includes('/api/properties')) {
    try {
      const pool = mysql.createPool(dbConfig);
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
      console.log('[DEBUG] Properties error:', err.message);
      return res.status(500).json({ error: err.message }); 
    }
  }
  
  // /api/properties/:id
  if (method === 'GET' && url?.match(/\/api\/properties\/\d+/)) {
    try {
      const id = url.match(/\/api\/properties\/(\d+)/)?.[1];
      const pool = mysql.createPool(dbConfig);
      
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
  
  // /api/auth/login
  if (method === 'POST' && url?.includes('/api/auth/login')) {
    try {
      const { email, password } = req.body;
      if (!email || !password) return res.status(400).json({ error: 'Email and password required' });
      
      const pool = mysql.createPool(dbConfig);
      const [rows]: any = await pool.query('SELECT id, name, email, password_hash, role, sub_role FROM users WHERE email = ? AND is_active = true', [email]);
      if (!rows || rows.length === 0) { await pool.end(); return res.status(401).json({ error: 'Invalid credentials' }); }
      
      const user = rows[0];
      const bcrypt = await import('bcryptjs');
      const validPassword = await bcrypt.default.compare(password, user.password_hash);
      if (!validPassword) { await pool.end(); return res.status(401).json({ error: 'Invalid credentials' }); }
      
      const jwt = await import('jsonwebtoken');
      const token = jwt.default.sign({ id: user.id, role: user.role, sub_role: user.sub_role, email: user.email }, process.env.JWT_SECRET || 'f6b6104a80af41be3d7660d251867a2793a60dd4f664784f1f62dda2c47542a6d47bab11919c736a9757c9f4790e44b2d3e3438bdd3afe9a3b4b69a2f8eb78c3', { expiresIn: '7d' });
      await pool.end();
      
      return res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role, sub_role: user.sub_role } });
    } catch (err: any) { return res.status(500).json({ error: err.message }); }
  }
  
  return res.json({ ok: true, service: 'Great Society API' });
}
