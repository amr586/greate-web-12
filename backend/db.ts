import mysql from 'mysql2/promise';
import pg from 'pg';

let pool: mysql.Pool | pg.Pool | null = null;
let dialect: 'mysql' | 'postgres' | null = null;

function getPool() {
  if (!pool) {
    const connectionString = process.env.DATABASE_URL;
    
    if (connectionString?.startsWith('mysql://')) {
      dialect = 'mysql';
      pool = mysql.createPool({
        uri: connectionString,
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0
      });
    } else if (connectionString?.startsWith('postgres://') || connectionString?.startsWith('postgresql://')) {
      dialect = 'postgres';
      pool = new pg.Pool({
        connectionString,
      });
    } else {
      throw new Error('Invalid DATABASE_URL. Use mysql://, postgres://, or postgresql:// format');
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
    if (dialect === 'postgres') {
      const result = await (pool as pg.Pool).query(text, params);
      return { rows: result.rows };
    }
    const convertedSql = convertPlaceholders(text);
    const [rows] = await (pool as mysql.Pool).execute(convertedSql, params);
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
    dialect = null;
  }
};
