import type { VercelRequest, VercelResponse } from '@vercel/node';
import * as cookie from 'cookie';
import { getSessionHash } from './lib/auth.js';

export default function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method Not Allowed' });
    return;
  }

  const { password } = req.body;
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminPassword) {
    res.status(500).json({ error: 'ADMIN_PASSWORD not configured' });
    return;
  }

  if (password !== adminPassword) {
    res.status(401).json({ error: 'Invalid password' });
    return;
  }

  try {
    const sessionHash = getSessionHash();
    
    // Set secure HTTP-only cookie
    res.setHeader('Set-Cookie', [
      cookie.serialize('session', sessionHash, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24, // 24 hours
      }),
      // Also set a non-httpOnly flag so the frontend knows we are logged in
      cookie.serialize('logged_in', '1', {
        httpOnly: false,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24,
      })
    ]);

    res.status(200).json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}
