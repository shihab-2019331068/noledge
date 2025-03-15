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
  const [showDialog, setShowDialog] = useState(false);
  const [pendingAudioFile, setPendingAudioFile] = useState<File | null>(null);
  const [generationTime, setGenerationTime] = useState<number>(0);
  const [selectedModel, setSelectedModel] = useState<'small' | 'medium' | 'large'>('medium');
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
    const startTime = Date.now();

    try {
      const formData = new FormData();
      formData.append("audio", file);
      formData.append("model", selectedModel);

      const response = await fetch("/api/transcribe", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      if (data.transcription) {
        const endTime = Date.now();
        setGenerationTime((endTime - startTime) / 1000);
        const srtContent = formatTranscriptionToSRT(data.transcription);
        const parsedSubtitles = parseSubtitles(srtContent);
        setSubtitles(parsedSubtitles);
        if (parsedSubtitles.length > 0) {
          setCurrentSubtitle(parsedSubtitles[0].text);
          setCurrentSubtitleIndex(0);
        }
      }
    } catch (error) {
      console.error("Error generating subtitles:", error);
    } finally {
      setLoading(false);
      setEtaSeconds(null);
    }
  };

  // Load audio file, set source, and calculate ETA
  useEffect(() => {
    if (audioFile && !textFile) {
      const src = URL.createObjectURL(audioFile);
      setAudioSrc(src);
      setPendingAudioFile(audioFile);
      setShowDialog(true);
      return () => URL.revokeObjectURL(src);
    } else if (audioFile && textFile) {
      // If both files are provided, just set the audio source
      const src = URL.createObjectURL(audioFile);
      setAudioSrc(src);
      return () => URL.revokeObjectURL(src);
    }
  }, [audioFile, textFile]);

  const handleGenerateSubtitles = () => {
    if (pendingAudioFile) {
      getAudioDuration(pendingAudioFile).then((duration) => {
        const eta = calculateETA(duration);
        setEtaSeconds(eta);
        generateSubtitles(pendingAudioFile);
      });
    }
    setShowDialog(false);
  };

  const handleUploadSubtitles = () => {
    setShowDialog(false);
    // User will need to upload subtitle file separately
  };

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
                Subtitles generated successfully! (Time taken: {generationTime.toFixed(1)} seconds)
              </div>
            )}
          </div>
        </div>
      )}

      {showDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl">
            <h3 className="text-lg font-medium mb-4 text-gray-900 dark:text-white">
              Choose Subtitle Source
            </h3>
            <div className="space-y-4">
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Whisper Model
                </label>
                <select
                  value={selectedModel}
                  onChange={(e) => setSelectedModel(e.target.value as 'small' | 'medium' | 'large')}
                  className="w-full p-2 border rounded bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                >
                  <option value="small">Small (Faster, less accurate)</option>
                  <option value="medium">Medium (Balanced)</option>
                  <option value="large">Large (Slower, more accurate)</option>
                </select>
              </div>
              <button
                className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                onClick={handleGenerateSubtitles}
              >
                Generate Subtitles
              </button>
              <button
                className="w-full px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
                onClick={handleUploadSubtitles}
              >
                Upload Subtitles
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}