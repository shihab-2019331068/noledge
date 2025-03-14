import { NextRequest, NextResponse } from "next/server";
import { exec } from "child_process";
import { promises as fs } from "fs";
import path from "path";

export async function POST(req: NextRequest) {
  try {
    // Get the audio file from the request
    const formData = await req.formData();
    const audioFile = formData.get("audio") as File;

    if (!audioFile) {
      return NextResponse.json({ error: "No audio file provided" }, { status: 400 });
    }

    // Save the audio file temporarily
    const buffer = Buffer.from(await audioFile.arrayBuffer());
    const tempFilePath = path.join(process.cwd(), "tmp", `${Date.now()}.wav`);
    await fs.mkdir(path.dirname(tempFilePath), { recursive: true });
    await fs.writeFile(tempFilePath, buffer);

    // Run Whisper to transcribe the audio
    const transcription = await new Promise<string>((resolve, reject) => {
      exec(
        `whisper "${tempFilePath}" --model small --output_format srt`,
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

    // Clean up the temporary file
    await fs.unlink(tempFilePath);

    // Return the transcription
    return NextResponse.json({ transcription });
  } catch (error) {
    console.error("Error in transcription:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}