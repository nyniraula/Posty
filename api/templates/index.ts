import type { VercelRequest, VercelResponse } from '@vercel/node';
import { nanoid } from 'nanoid';
import { db } from '../lib/db';
import { requireAuth } from '../lib/auth';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'GET') {
    if (!requireAuth(req, res)) return;

    try {
      const result = await db.execute(
        'SELECT id, name, width, height, created_at, updated_at FROM templates ORDER BY updated_at DESC'
      );

      res.status(200).json(
        result.rows.map((row) => ({
          id: row.id,
          name: row.name,
          width: row.width,
          height: row.height,
          createdAt: row.created_at,
          updatedAt: row.updated_at,
        }))
      );
    } catch (err) {
      console.error('[templates] GET / error:', err);
      res.status(500).json({ error: 'Failed to list templates' });
    }
  } else if (req.method === 'POST') {
    if (!requireAuth(req, res)) return;

    try {
      const { name, background, width, height, fields } = req.body;

      if (!name || !background || !width || !height) {
        res.status(400).json({ error: 'Missing required fields: name, background, width, height' });
        return;
      }

      const id = nanoid(10);

      await db.execute({
        sql: `INSERT INTO templates (id, name, background, width, height, fields)
              VALUES (?, ?, ?, ?, ?, ?)`,
        args: [id, name, background, width, height, JSON.stringify(fields || [])],
      });

      res.status(201).json({ id });
    } catch (err) {
      console.error('[templates] POST / error:', err);
      res.status(500).json({ error: 'Failed to create template' });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
