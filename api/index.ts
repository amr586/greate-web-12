import mysql from 'mysql2/promise';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET as string;
if (!JWT_SECRET || JWT_SECRET.length < 32) {
  throw new Error('JWT_SECRET must be at least 32 characters. Set VERCEL_JWT_SECRET env var.');
}

let dbPool: any = null;
let poolInit = false;

async function getPool() {
  if (dbPool) return dbPool;
  
  const dbConfig = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: parseInt(process.env.DB_PORT || '3306'),
    waitForConnections: true,
    connectionLimit: 2,
    queueLimit: 0,
    idleTimeout: 30000,
    enableKeepAlive: true
  };

  if (!dbConfig.host || !dbConfig.user || !dbConfig.password || !dbConfig.database) {
    throw new Error('Database configuration missing');
  }

  dbPool = mysql.createPool(dbConfig);
  return dbPool;
}

function verifyToken(token: string): any {
try {
        res.status(500);
      } catch (err: any) {
      }
    }

    // Default response
  
  return res.json({ ok: true, service: 'Great Society API' });
}