'use client'

import { useState, useEffect } from 'react'
import Tile from './components/Tile'; // Adjust the path as necessary


interface RecentVideo {
  id: string;
  title: string;
  timestamp: number;
}

const HistoryPage = () =>  {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [isDarkMode, setIsDarkMode] = useState(true)
  const [videoUrl, setVideoUrl] = useState('');
  const [videoId, setVideoId] = useState('');
  const [videoKey, setVideoKey] = useState(0);
  const [recentVideos, setRecentVideos] = useState<RecentVideo[]>([]);

  useEffect(() => {
    // Load recent videos from localStorage
    const saved = localStorage.getItem('recentYoutubeVideos');
    if (saved) {
      setRecentVideos(JSON.parse(saved));
    }
  }, []);

  const handleRecentVideoClick = (id: string) => {
    setVideoId(id);
    setVideoKey(k => k + 1);
  };

  const handleAddToPlaylist = (id: string) => {
    // TODO: Implement playlist functionality
    console.log('Add to playlist:', id);
  };

  return (
    <div className={`min-h-screen flex flex-col ${isDarkMode ? 'dark' : ''}`}>
      <div className="flex flex-1">
        <main className={`flex-1 transition-all duration-300 ${isSidebarOpen ? 'ml-48' : 'ml-16'}`}>
          <div className="p-2 w-full">
            <h2 className="text-2xl font-bold mb-2 text-gray-800 dark:text-white">Recent Videos</h2>
            <div className="space-y-2">
              {recentVideos.map(video => (
                <Tile
                  key={video.id}
                  {...video}
                  onVideoClick={handleRecentVideoClick}
                  onAddToPlaylist={handleAddToPlaylist}
                />
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
};

export default HistoryPage;