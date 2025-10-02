import type { NextApiRequest, NextApiResponse } from 'next';
import { sql } from '../../lib/db';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'POST') {
    try {
      const { username, message, image_url, priority = 'medium' } = req.body;

      if (!username || !message) {
        return res.status(400).json({ 
          error: 'Missing required fields',
          required: ['username', 'message']
        });
      }

      const result = await sql`
        INSERT INTO tickets (username, message, image_url, priority, status)
        VALUES (${username}, ${message}, ${image_url || null}, ${priority}, 'open')
        RETURNING *
      `;

      console.log('✅ Ticket created:', result[0]);

      return res.status(200).json({ 
        success: true,
        ticket: result[0]
      });

    } catch (error) {
      console.error('❌ Error:', error);
      return res.status(500).json({ 
        error: 'Database error',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
