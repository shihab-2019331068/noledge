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
  
  return (
    <div className="space-y-6">
      <div className="max-w-4xl mx-auto">
        <YoutubePlayer
          videoSrc=""
          mode="youtube"
          youtubeVideoId={videoId || undefined}
          key={videoKey}
        />
      </div>
    </div>
  );
}
