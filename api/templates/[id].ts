import type { VercelRequest, VercelResponse } from '@vercel/node';
import ImageKit from 'imagekit';
import { db } from '../../lib/db';
import { requireAuth } from '../../lib/auth';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { id } = req.query;
  const templateId = Array.isArray(id) ? id[0] : id;

  if (!templateId) {
    res.status(400).json({ error: 'Missing template ID' });
    return;
  }

  if (req.method === 'GET') {
    try {
      const result = await db.execute({
        sql: 'SELECT * FROM templates WHERE id = ?',
        args: [templateId],
      });

      if (result.rows.length === 0) {
        res.status(404).json({ error: 'Template not found' });
        return;
      }

      const row = result.rows[0];
      res.status(200).json({
        id: row.id,
        name: row.name,
        background: row.background,
        width: row.width,
        height: row.height,
        fields: JSON.parse(row.fields as string),
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      });
    } catch (err) {
      console.error('[templates] GET /:id error:', err);
      res.status(500).json({ error: 'Failed to fetch template' });
    }
  } else if (req.method === 'PUT') {
    if (!requireAuth(req, res)) return;

    try {
      const { name, background, width, height, fields } = req.body;

      const result = await db.execute({
        sql: `UPDATE templates
              SET name = ?, background = ?, width = ?, height = ?, fields = ?, updated_at = datetime('now')
              WHERE id = ?`,
        args: [name, background, width, height, JSON.stringify(fields || []), templateId],
      });

      if (result.rowsAffected === 0) {
        res.status(404).json({ error: 'Template not found' });
        return;
      }

      res.status(200).json({ success: true });
    } catch (err) {
      console.error('[templates] PUT /:id error:', err);
      res.status(500).json({ error: 'Failed to update template' });
    }
  } else if (req.method === 'DELETE') {
    if (!requireAuth(req, res)) return;

    try {
      const fetchRes = await db.execute({
        sql: 'SELECT background FROM templates WHERE id = ?',
        args: [templateId],
      });

      if (fetchRes.rows.length === 0) {
        res.status(404).json({ error: 'Template not found' });
        return;
      }

      const backgroundUrl = fetchRes.rows[0].background as string;

      // Delete from ImageKit if applicable
      if (backgroundUrl && backgroundUrl.includes('ik.imagekit.io') && process.env.IMAGEKIT_PUBLIC_KEY) {
        try {
          const imagekit = new ImageKit({
            publicKey: process.env.IMAGEKIT_PUBLIC_KEY || '',
            privateKey: process.env.IMAGEKIT_PRIVATE_KEY || '',
            urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT || '',
          });

          const filename = backgroundUrl.split('/').pop();
          if (filename) {
            const files = await imagekit.listFiles({
              searchQuery: `name="${filename}"`,
            });
            if (files && files.length > 0) {
              await imagekit.deleteFile(files[0].fileId);
            }
          }
        } catch (imgErr) {
          console.error('[templates] Failed to delete image from ImageKit:', imgErr);
        }
      }

      const result = await db.execute({
        sql: 'DELETE FROM templates WHERE id = ?',
        args: [templateId],
      });

      res.status(200).json({ success: true });
    } catch (err) {
      console.error('[templates] DELETE /:id error:', err);
      res.status(500).json({ error: 'Failed to delete template' });
    }
  } else {
    res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
