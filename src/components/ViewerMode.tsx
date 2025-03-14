"use client";

import React, { useState, useRef, useEffect } from "react";
import VideoPlayer from "./VideoPlayer";

interface Subtitle {
  startTime: number;
  endTime: number;
  text: string;
}

interface ViewerModeProps {
  audioFile: File | null;
  textFile: File | null;
}

export default function ViewerMode({ audioFile, textFile }: ViewerModeProps) {
  const [subtitles, setSubtitles] = useState<Subtitle[]>([]);
  const [currentSubtitle, setCurrentSubtitle] = useState<string>("");
  const [currentSubtitleIndex, setCurrentSubtitleIndex] = useState<number>(-1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isTheaterMode, setIsTheaterMode] = useState(false);
  const [audioSrc, setAudioSrc] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [etaSeconds, setEtaSeconds] = useState<number | null>(null); // ETA in seconds
  const audioRef = useRef<HTMLAudioElement>(null);

  // Process text file when it changes
  useEffect(() => {
    if (textFile) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        if (content) {
          const parsedSubtitles = parseSubtitles(content);
          setSubtitles(parsedSubtitles);
          if (parsedSubtitles.length > 0) {
            setCurrentSubtitle(parsedSubtitles[0].text);
            setCurrentSubtitleIndex(0);
          }
        }
      };
      reader.readAsText(textFile);
    }
  }, [textFile]);

  // Format transcription data to SRT format
  const formatTranscriptionToSRT = (transcription: string): string => {
    const lines = transcription.split('\n');
    let srtContent = '';
    let counter = 1;

    lines.forEach((line) => {
      const match = line.match(/\[(\d{2}:\d{2}\.\d{3})\s*-->\s*(\d{2}:\d{2}\.\d{3})\]\s*(.*)/);
      if (match) {
        const [, startStr, endStr, text] = match;
        
        // Convert MM:SS.mmm to SRT format (00:MM:SS,mmm)
        const startSRT = `00:${startStr.replace('.', ',')}`;
        const endSRT = `00:${endStr.replace('.', ',')}`;
        
        srtContent += `${counter}\n`;
        srtContent += `${startSRT} --> ${endSRT}\n`;
        srtContent += `${text.trim()}\n\n`;
        counter++;
      }
    });

    return srtContent;
  };

  // Function to generate subtitles using Whisper via API
  const generateSubtitles = async (file: File) => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("audio", file);

      const response = await fetch("/api/transcribe", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      if (data.transcription) {
        // Format the transcription into SRT format before parsing
        const srtContent = formatTranscriptionToSRT(data.transcription);
        const parsedSubtitles = parseSubtitles(srtContent);
        setSubtitles(parsedSubtitles);
        if (parsedSubtitles.length > 0) {
          setCurrentSubtitle(parsedSubtitles[0].text);
          setCurrentSubtitleIndex(0);
        }
      } else {
        console.error("Subtitle generation failed:", data.error);
      }
    } catch (error) {
      console.error("Error generating subtitles:", error);
    } finally {
      setLoading(false);
      setEtaSeconds(null); // Reset ETA when done
    }
  };

  // Load audio file, set source, and calculate ETA
  useEffect(() => {
    if (audioFile) {
      const src = URL.createObjectURL(audioFile);
      setAudioSrc(src);
      getAudioDuration(audioFile).then((duration) => {
        const eta = calculateETA(duration); // Calculate ETA based on duration
        setEtaSeconds(eta);
        generateSubtitles(audioFile); // Trigger subtitle generation
      });
      return () => URL.revokeObjectURL(src); // Cleanup
    }
  }, [audioFile]);

  // Get audio duration using an Audio element
  const getAudioDuration = (file: File): Promise<number> => {
    return new Promise((resolve) => {
      const audio = new Audio(URL.createObjectURL(file));
      audio.addEventListener("loadedmetadata", () => {
        resolve(audio.duration);
        URL.revokeObjectURL(audio.src); // Clean up
      });
    });
  };

  // Calculate ETA: 20s audio = 60s processing (3x factor)
  const calculateETA = (duration: number): number => {
    const processingFactor = 3; // 60s / 20s = 3
    return Math.ceil(duration * processingFactor); // Round up to nearest second
  };

  // Update ETA countdown every second
  useEffect(() => {
    if (loading && etaSeconds !== null && etaSeconds > 0) {
      const timer = setInterval(() => {
        setEtaSeconds((prev) => (prev !== null && prev > 0 ? prev - 1 : 0));
      }, 1000);
      return () => clearInterval(timer); // Cleanup on unmount or when loading stops
    }
  }, [loading, etaSeconds]);

  const parseSubtitles = (content: string): Subtitle[] => {
    const lines = content.trim().split("\n");
    const subtitles: Subtitle[] = [];
    let i = 0;

    while (i < lines.length) {
      if (!isNaN(Number(lines[i]))) {
        i++;
        const timeLine = lines[i];
        if (timeLine?.includes("-->")) {
          const [start, end] = timeLine.split("-->").map((t) => timeToSeconds(t.trim()));
          i++;
          const text = lines[i]?.trim();
          if (text) {
            subtitles.push({ startTime: start, endTime: end, text });
          }
          i++;
        }
      } else {
        i++;
      }
    }
    return subtitles;
  };

  const timeToSeconds = (timeStr: string): number => {
    const [time, ms] = timeStr.split(",");
    const [hours, minutes, seconds] = time.split(":").map(Number);
    return hours * 3600 + minutes * 60 + seconds + Number(ms) / 1000;
  };

  const updateSubtitle = (currentTime: number) => {
    const subtitleIndex = subtitles.findIndex(
      (sub) => currentTime >= sub.startTime && currentTime <= sub.endTime
    );

    if (subtitleIndex !== -1) {
      setCurrentSubtitle(subtitles[subtitleIndex].text || "");
      setCurrentSubtitleIndex(subtitleIndex);
    } else {
      setCurrentSubtitle("");
      const nextSubtitleIndex = subtitles.findIndex((sub) => currentTime < sub.startTime);
      if (nextSubtitleIndex !== -1) {
        setCurrentSubtitleIndex(nextSubtitleIndex - 1);
      }
    }
  };

  const handleTogglePlay = (playing: boolean) => {
    setIsPlaying(playing);
  };
  
  // Format ETA into minutes and seconds
  const formatETA = (seconds: number | null): string => {
    if (seconds === null || seconds <= 0) return "0s";
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return minutes > 0 ? `${minutes}m ${remainingSeconds}s` : `${remainingSeconds}s`;
  };

  return (
    <div className="space-y-6 w-full">
      <div
        className={
          isTheaterMode
            ? "fixed inset-0 z-50 bg-black flex items-center justify-center"
            : "relative w-full"
        }
      >
        <VideoPlayer
          src={audioSrc}
          subtitleText={currentSubtitle}
          onTimeUpdate={updateSubtitle}
          onTogglePlay={handleTogglePlay}
          className={isTheaterMode ? "aspect-video shadow-2xl" : "shadow-lg w-full"}
        />
      </div>

      {!isTheaterMode && (
        <div className="p-4 border rounded bg-gray-50 dark:bg-gray-800 dark:border-gray-700 w-full max-h-[400px] overflow-auto">
          <h3 className="font-medium mb-2 text-white">Subtitles:</h3>
          <div className="space-y-2">
            {loading ? (
              <div className="p-2 rounded text-sm text-white bg-gray-700 dark:bg-gray-600 flex items-center justify-center">
                <svg
                  className="animate-spin h-5 w-5 mr-2 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  />
                </svg>
                Generating subtitles... (ETA: {formatETA(etaSeconds)})
              </div>
            ) : subtitles.length === 0 ? (
              <div className="p-2 rounded text-sm text-white bg-gray-700 dark:bg-gray-600">
                No subtitles available yet.
              </div>
            ) : (
              <div className="p-2 rounded text-sm text-white bg-gray-700 dark:bg-gray-600">
                Subtitle added Sucksexfully!!
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}