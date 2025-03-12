'use client'

import { useState, useEffect } from 'react'
import Sidebar from '@/components/Sidebar'
import TopBar from '@/app/history/TopBar'
import Tile from './components/Tile'

interface RecentVideo {
  id: string;
  title: string;
  timestamp: number;
}

export default function Home() {
  const [mode, setMode] = useState<'editor' | 'viewer' | 'youtube'>('youtube')
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
  

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen)
  }

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode)
  }

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
      <TopBar 
        onToggleSidebar={toggleSidebar}
      />
      <div className="flex flex-1">
        <Sidebar 
          isOpen={isSidebarOpen}
          onThemeToggle={toggleTheme}
          isDarkMode={isDarkMode}
        />
        <main className={`flex-1 pt-16 transition-all duration-300 ${isSidebarOpen ? 'ml-64' : 'ml-20'}`}>
          <div className="p-6 max-w-3xl mx-auto w-full">
            <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">Recent Videos</h2>
            <div className="space-y-4">
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
}