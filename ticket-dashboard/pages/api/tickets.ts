import type { NextApiRequest, NextApiResponse } from 'next';
import { sql } from '../../lib/db';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, PATCH, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'GET') {
    try {
      const { status } = req.query;
      
      let tickets;
      if (status && status !== 'all') {
        tickets = await sql`
          SELECT * FROM tickets 
          WHERE status = ${status}
          ORDER BY created_at DESC
        `;
      } else {
        tickets = await sql`
          SELECT * FROM tickets 
          ORDER BY created_at DESC
        `;
      }

      return res.status(200).json(tickets);
    } catch (error) {
      console.error('❌ Error:', error);
      return res.status(500).json({ error: 'Database error' });
    }
  }

  if (req.method === 'PATCH') {
    try {
      const { id, status } = req.body;

      const result = await sql`
        UPDATE tickets 
        SET status = ${status}, updated_at = CURRENT_TIMESTAMP
        WHERE id = ${id}
        RETURNING *
      `;

      if (result.length === 0) {
        return res.status(404).json({ error: 'Ticket not found' });
      }

      return res.status(200).json({ 
        success: true,
        ticket: result[0]
      });
    } catch (error) {
      console.error('❌ Error:', error);
      return res.status(500).json({ error: 'Database error' });
    }
  }

  if (req.method === 'DELETE') {
    try {
      const { id } = req.query;

      await sql`
        DELETE FROM tickets 
        WHERE id = ${id}
      `;

      return res.status(200).json({ success: true });
    } catch (error) {
      console.error('❌ Error:', error);
      return res.status(500).json({ error: 'Database error' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
