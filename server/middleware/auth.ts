import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'iskantek_secret_2024';

export interface AuthRequest extends Request {
  user?: {
    id: number;
    role: string;
    sub_role?: string;
    email: string;
  };
}

export const authenticate = (req: AuthRequest, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'غير مصرح' });
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    req.user = decoded;
    next();
  } catch {
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
