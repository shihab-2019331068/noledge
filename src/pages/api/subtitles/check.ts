import { NextApiRequest, NextApiResponse } from 'next';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { audioFileName, fileSize } = req.body;

  if (!audioFileName || !fileSize) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const client = await pool.connect();
  try {
    const result = await client.query(
      'SELECT subtitles FROM cached_subtitles WHERE audio_file_name = $1 AND file_size = $2',
      [audioFileName, fileSize]
    );

    if (result.rows.length > 0) {
      return res.status(200).json({ subtitles: result.rows[0].subtitles });
    }
    
    return res.status(404).json({ message: 'No cached subtitles found' });
  } catch (error) {
    console.error('Database error:', error);
    return res.status(500).json({ error: 'Database error' });
  } finally {
    client.release();
  }
}
