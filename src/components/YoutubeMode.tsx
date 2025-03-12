'use client'

import React, { useState, useEffect } from 'react';
import YoutubePlayer from './YoutubePlayer';

interface RecentVideo {
  id: string;
  title: string;
  timestamp: number;
}

interface YoutubeModeProps {
  initialVideoId: string | null;
}

const fetchVideoTitle = async (videoId: string): Promise<string> => {
  try {
    const response = await fetch(
      `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`
    );
    const data = await response.json();
    return data.title;
  } catch (error) {
    console.error('Error fetching video title:', error);
    return `Unknown Video (${videoId})`;
  }
};

export default function YoutubeMode({ initialVideoId }: YoutubeModeProps) {
  const [videoUrl, setVideoUrl] = useState('');
  const [videoId, setVideoId] = useState<string | null>(initialVideoId);
  const [videoKey, setVideoKey] = useState(0);
  const [recentVideos, setRecentVideos] = useState<RecentVideo[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    // Load recent videos from localStorage
    const saved = localStorage.getItem('recentYoutubeVideos');
    if (saved) {
      setRecentVideos(JSON.parse(saved));
    }
  }, []);

  useEffect(() => {
    if (initialVideoId) {
      setVideoId(initialVideoId);
    }
  }, [initialVideoId]);

  const extractVideoId = (url: string): string | null => {
    try {
      const urlObj = new URL(url);
      if (urlObj.hostname.includes('youtube.com')) {
        return urlObj.searchParams.get('v');
      } else if (urlObj.hostname.includes('youtu.be')) {
        return urlObj.pathname.slice(1);
      }
    } catch (e) {
      // If it's not a URL, check if it's a direct video ID
      if (/^[a-zA-Z0-9_-]{11}$/.test(url)) {
        return url;
      }
    }
    return null;
  };

  const handleUrlInput = async (url: string) => {
    const id = extractVideoId(url);
    if (id) {
      setVideoId(id);
      setVideoKey(k => k + 1);
      setError('');
      
      const title = await fetchVideoTitle(id);
      const newRecent = {
        id,
        title,
        timestamp: Date.now(),
      };
      
      const updated = [newRecent, ...recentVideos.filter(v => v.id !== id)].slice(0, 10);
      setRecentVideos(updated);
      localStorage.setItem('recentYoutubeVideos', JSON.stringify(updated));
    } else {
      setError('Invalid YouTube URL or ID');
    }
    setVideoUrl('');
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setVideoUrl(text);
      handleUrlInput(text);
    } catch (err) {
      setError('Failed to read from clipboard');
    }
  };

  const handleRecentVideoClick = (id: string) => {
    setVideoId(id);
    setVideoKey(k => k + 1);
  };

  return (
    <div className="space-y-6">
      <div className="max-w-4xl mx-auto">
        <YoutubePlayer
          videoSrc=""
          mode="youtube"
          youtubeVideoId={videoId || undefined}
          key={videoKey}
        />

        <div className="mt-4 flex justify-center">
          <button
            onClick={handlePaste}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 flex items-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
              <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z" />
            </svg>
            Paste URL
          </button>
        </div>
        {error && <p className="text-red-500 mt-2 text-center">{error}</p>}
      </div>
    </div>
  );
}
