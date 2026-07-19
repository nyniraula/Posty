import { VercelRequest, VercelResponse } from '@vercel/node';
import * as cookie from 'cookie';
import crypto from 'crypto';

export function getSessionHash(): string {
  const password = process.env.ADMIN_PASSWORD;
  if (!password) {
    throw new Error('ADMIN_PASSWORD is not set');
  }
  return crypto.createHmac('sha256', password).update('admin-session').digest('hex');
}

export function isAuthenticated(req: VercelRequest): boolean {
  const cookieStr = typeof req.headers.cookie === 'string' ? req.headers.cookie : '';
  const cookies = cookie.parse(cookieStr);
  if (!cookies.session) return false;

  try {
    const expected = getSessionHash();
    return cookies.session === expected;
  } catch (err) {
    return false;
  }
}

export function requireAuth(req: VercelRequest, res: VercelResponse): boolean {
  if (!isAuthenticated(req)) {
    res.status(401).json({ error: 'Unauthorized' });
    return false;
  }
  return true;
}
