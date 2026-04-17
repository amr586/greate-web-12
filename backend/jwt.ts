import crypto from 'crypto';

let developmentJwtSecret: string | undefined;

export function getJwtSecret(): string {
  if (process.env.JWT_SECRET) {
    return process.env.JWT_SECRET;
  }

  if (process.env.NODE_ENV === 'production') {
    throw new Error('FATAL: JWT_SECRET environment variable is required. Set it before starting the server.');
  }

  if (!developmentJwtSecret) {
    developmentJwtSecret = crypto.randomBytes(32).toString('hex');
    console.warn('[AUTH] JWT_SECRET is not set. Using an ephemeral development-only secret.');
  }

  return developmentJwtSecret;
}