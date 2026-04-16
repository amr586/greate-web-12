import mysql from 'mysql2/promise';

export default async function handler(req: any, res: any) {
  const { query, method, url } = req;
  
  // Build database config from environment
  let dbConfig: any = {
    waitForConnections: true,
    connectionLimit: 2
  };
  
  // Try to get from DATABASE_URL first
  if (process.env.DATABASE_URL && process.env.DATABASE_URL.startsWith('mysql://')) {
    dbConfig.uri = process.env.DATABASE_URL;
  }
  // Otherwise use individual config vars
  else {
    dbConfig = {
      ...dbConfig,
      host: process.env.DB_HOST || 'srv2121.hstgr.io',
      user: process.env.DB_USER || 'u156204542_amr',
      password: process.env.DB_PASSWORD || 'Amrahmed01281378331',
      database: process.env.DB_NAME || 'u156204542_Dbase',
      port: parseInt(process.env.DB_PORT || '3306')
    };
  }
  
  console.log('[DEBUG] Using config:', { 
    hasUri: !!dbConfig.uri, 
    host: dbConfig.host, 
    db: dbConfig.database 
  });
  
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
  
  return res.json({ ok: true, service: 'Great Society API' });
}
