import { NextRequest, NextResponse } from "next/server";
import { exec } from "child_process";
import { promises as fs } from "fs";
import path from "path";
import { Pool } from "pg";

type WhisperModel = 'small' | 'medium' | 'large';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const isValidModel = (model: string): model is WhisperModel => {
  return ['small', 'medium', 'large'].includes(model);
};

async function checkCachedSubtitles(fileName: string, fileSize: number): Promise<string | null> {
  try {
    const result = await pool.query(
      'SELECT subtitles FROM cached_subtitles WHERE audio_file_name = $1 AND file_size = $2',
      [fileName, fileSize]
    );

    if (result.rows.length > 0) {
      return result.rows[0].subtitles;
    }
    return null;
  } catch (error) {
    console.error('Database error:', error);
    return null;
  }
}

async function cacheSubtitles(fileName: string, fileSize: number, subtitles: string): Promise<void> {
  try {
    await pool.query(
      `INSERT INTO cached_subtitles (audio_file_name, file_size, subtitles)
       VALUES ($1, $2, $3)
       ON CONFLICT (audio_file_name, file_size) 
       DO UPDATE SET subtitles = $3`,
      [fileName, fileSize, subtitles]
    );
  } catch (error) {
    console.error('Database error:', error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const audioFile = formData.get("audio") as File;
    const model = formData.get("model") as string || 'medium';

    if (!audioFile) {
      return NextResponse.json({ error: "No audio file provided" }, { status: 400 });
    }

    if (!isValidModel(model)) {
      return NextResponse.json({ error: "Invalid model specified" }, { status: 400 });
    }

    // Check cache first
    const cachedSubtitles = await checkCachedSubtitles(audioFile.name, audioFile.size);
    if (cachedSubtitles) {
      return NextResponse.json({ transcription: cachedSubtitles });
    }

    // If not in cache, proceed with transcription
    const buffer = Buffer.from(await audioFile.arrayBuffer());
    const tempFilePath = path.join(process.cwd(), "tmp", `${Date.now()}.wav`);
    await fs.mkdir(path.dirname(tempFilePath), { recursive: true });
    await fs.writeFile(tempFilePath, buffer);

    const transcription = await new Promise<string>((resolve, reject) => {
      exec(
        `whisper "${tempFilePath}" --model ${model} --output_format srt`,
        (error, stdout, stderr) => {
          if (error) {
            console.error("Whisper error:", stderr);
            reject(new Error("Transcription failed"));
          } else {
            resolve(stdout);
          }
        }
      );
    });

    // Cache the transcription
    await cacheSubtitles(audioFile.name, audioFile.size, transcription);

    // Clean up the temporary file
    await fs.unlink(tempFilePath);

    return NextResponse.json({ transcription });
  } catch (error) {
    console.error("Error in transcription:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}