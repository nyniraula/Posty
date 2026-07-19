import type { VercelRequest, VercelResponse } from '@vercel/node';
import ImageKit from 'imagekit';
import { requireAuth } from '../lib/auth.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
    return;
  }

  if (!requireAuth(req, res)) return;

  try {
    const { image, fileName } = req.body;

    if (!image) {
      res.status(400).json({ error: 'No image provided' });
      return;
    }

    if (!process.env.IMAGEKIT_PUBLIC_KEY) {
      res.status(500).json({ error: 'ImageKit is not configured on the server. Check .env' });
      return;
    }

    const imagekit = new ImageKit({
      publicKey: process.env.IMAGEKIT_PUBLIC_KEY || '',
      privateKey: process.env.IMAGEKIT_PRIVATE_KEY || '',
      urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT || '',
    });

    // Extract raw base64 data if it contains data URL prefix
    const base64Data = image.replace(/^data:image\/\w+;base64,/, '');

    const result = await imagekit.upload({
      file: base64Data,
      fileName: fileName || `bg_${Date.now()}.jpg`,
      folder: '/posty',
    });

    res.status(200).json({ url: result.url });
  } catch (err) {
    console.error('[templates] POST /upload error:', err);
    res.status(500).json({ error: 'Failed to upload image' });
  }
}
