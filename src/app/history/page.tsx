'use client'

import { useState, useEffect } from 'react';

interface RecentVideo {
  id: string;
  title: string;
  timestamp: number;
}

export default function HistoryPage() {
  const [recentVideos, setRecentVideos] = useState<RecentVideo[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('recentYoutubeVideos');
    if (saved) {
      setRecentVideos(JSON.parse(saved));
    }
  }, []);

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Watch History</h1>
      <div className="space-y-2">
        {recentVideos.map((video) => (
          <div
            key={video.id}
            className="w-full p-4 rounded-lg bg-white dark:bg-gray-800 shadow"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">{video.title}</h3>
                <p className="text-sm text-gray-500">
                  {new Date(video.timestamp).toLocaleDateString()}
                </p>
              </div>
              <a
                href={`/youtube?v=${video.id}`}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Watch Again
              </a>
            </div>
          </div>
        ))}
      </div>
      {recentVideos.length === 0 && (
        <p className="text-gray-500 text-center">No watch history yet</p>
      )}
    </div>
  );
}
