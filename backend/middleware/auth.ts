import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error('FATAL: JWT_SECRET environment variable is required. Set it before starting the server.');
}

export const JWT_OPTIONS = {
  expiresIn: '7d',
} as const;

export const SENSITIVE_OPTS = {
  expiresIn: '1h',
} as const;

export const RATE_LIMIT_WINDOW = 5 * 60 * 1000;
export const RATE_LIMIT_MAX_ATTEMPTS = 5;

export const loginAttempts = new Map<string, { attempts: number; lockedUntil: number; ip: string }>();
export const otpAttempts = new Map<string, { attempts: number; lockedUntil: number }>();

function getClientIP(req: Request): string {
  const forwarded = req.headers['x-forwarded-for'] as string;
  return forwarded ? forwarded.split(',')[0].trim() : req.ip || req.socket.remoteAddress || 'unknown';
}

export interface AuthRequest extends Request {
  user?: {
    id: number;
    role: string;
    sub_role?: string;
    email: string;
    deviceId?: string;
    isNewDevice?: boolean;
  };
}

export const authenticate = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.split(' ')[1];

  if (!token) {
    console.log('[AUTH] No token provided');
    return res.status(401).json({ error: 'غير مصرح' });
  }

  console.log('[AUTH DEBUG] Token preview:', token.slice(0, 30) + '...');
  console.log('[AUTH DEBUG] JWT_SECRET preview:', JWT_SECRET?.slice(0, 20) + '...');

  try {
    const decoded = jwt.verify(token, JWT_SECRET, JWT_OPTIONS) as AuthRequest['user'];
    req.user = decoded;
    console.log('[AUTH] User authenticated:', decoded.email);
    next();
  } catch (err) {
    console.error('[AUTH ERROR] Token verify failed:', err?.message || err);
    return res.status(401).json({ error: 'رمز منتهي الصلاحية' });
  }
};

export const requireAdmin = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (!req.user || !['admin', 'superadmin'].includes(req.user.role)) {
    return res.status(403).json({ error: 'غير مسموح' });
  }
  next();
};

export const requireSuperAdmin = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (!req.user || req.user.role !== 'superadmin') {
    return res.status(403).json({ error: 'للسوبر أدمن فقط' });
  }
  next();
};

export function checkRateLimit(
  key: string,
  store: Map<string, { attempts: number; lockedUntil: number }>,
  maxAttempts: number,
  windowMs: number
): { allowed: boolean; remaining: number; lockedUntil?: number } {
  const now = Date.now();
  const record = store.get(key);

  if (!record) return { allowed: true, remaining: maxAttempts };

  if (record.lockedUntil && now < record.lockedUntil) {
    return { allowed: false, remaining: 0, lockedUntil: record.lockedUntil };
  }

  if (record.lockedUntil && now >= record.lockedUntil) {
    store.delete(key);
    return { allowed: true, remaining: maxAttempts };
  }

  const remaining = maxAttempts - record.attempts;
  return { allowed: remaining > 0, remaining };
}

export function recordFailedAttempt(
  key: string,
  store: Map<string, { attempts: number; lockedUntil: number }>,
  maxAttempts: number,
  windowMs: number,
  lockoutMs: number = 15 * 60 * 1000
): { attempts: number; remaining: number; lockedUntil?: number } {
  const now = Date.now();
  const record = store.get(key) || { attempts: 0, lockedUntil: 0 };

  if (now > record.lockedUntil) {
    const newRecord = { attempts: 1, lockedUntil: now + windowMs };
    store.set(key, newRecord);
    return { attempts: 1, remaining: maxAttempts - 1 };
  }

  record.attempts += 1;

  if (record.attempts >= maxAttempts) {
    record.lockedUntil = now + lockoutMs;
    store.set(key, record);
    return { attempts: record.attempts, remaining: 0, lockedUntil: record.lockedUntil };
  }

  store.set(key, record);
  return { attempts: record.attempts, remaining: maxAttempts - record.attempts };
}

export function clearRateLimit(key: string) {
  loginAttempts.delete(key);
  otpAttempts.delete(key);
}

export function generateDeviceId(req: Request): string {
  const forwarded = req.headers['x-forwarded-for'] as string;
  const ip = forwarded ? forwarded.split(',')[0].trim() : req.ip || req.socket.remoteAddress || 'unknown';
  const userAgent = req.headers['user-agent'] || 'unknown';
  return crypto.createHash('sha256').update(`${ip}:${userAgent}`).digest('hex').slice(0, 16);
}

export function exportRateLimits() {
  return {
    loginAttempts: loginAttempts.size,
    otpAttempts: otpAttempts.size,
  };
}