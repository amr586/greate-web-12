import mysql from 'mysql2/promise';

let pool: mysql.Pool | null = null;

function getPool() {
  if (!pool) {
    const connectionString = process.env.DATABASE_URL;
    
    if (connectionString?.startsWith('mysql://')) {
      pool = mysql.createPool({
        uri: connectionString,
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0
      });
    } else {
      throw new Error('Invalid DATABASE_URL. Use mysql:// format');
    }
  }
  return pool;
}

function convertPlaceholders(sql: string): string {
  if (!sql.includes('$')) return sql;
  let counter = 0;
  return sql.replace(/\$(\d+)/g, () => {
    counter++;
    return '?';
  });
}

export const query = async (text: string, params?: any[]) => {
  try {
    const pool = getPool();
    const convertedSql = convertPlaceholders(text);
    const [rows] = await pool.execute(convertedSql, params);
    return { rows: Array.isArray(rows) ? rows : [rows] };
  } catch (err: any) {
    console.error('[DB ERROR]', err.message);
    throw err;
  }
};

export const poolClose = async () => {
  if (pool) {
    await pool.end();
    pool = null;
  }
};
