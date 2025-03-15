import { NextApiRequest, NextApiResponse } from 'next';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { audioFileName, fileSize, subtitles } = req.body;

  if (!audioFileName || !fileSize || !subtitles) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const client = await pool.connect();
  try {
    await client.query(
      `INSERT INTO cached_subtitles (audio_file_name, file_size, subtitles)
       VALUES ($1, $2, $3)
       ON CONFLICT (audio_file_name, file_size) 
       DO UPDATE SET subtitles = $3`,
      [audioFileName, fileSize, subtitles]
    );

    return res.status(200).json({ message: 'Subtitles cached successfully' });
  } catch (error) {
    console.error('Database error:', error);
    return res.status(500).json({ error: 'Database error' });
  } finally {
    client.release();
  }
}
