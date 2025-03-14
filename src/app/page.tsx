'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import EditorMode from '@/components/EditorMode'
import ViewerMode from '@/components/ViewerMode'
import Sidebar from '@/components/Sidebar'
import TopBar from '@/components/TopBar'
import YoutubeMode from '@/components/YoutubeMode'
import PlaylistsPage from './playlists/PlaylistsPage'
import HistoryPage from './history/HistoryPage'

interface RecentVideo {
  id: string;
  timestamp: string;
  title?: string;
}

export default function Home() {
  const [mode, setMode] = useState<'editor' | 'viewer' | 'youtube' | 'history' | 'playlists'>('youtube')
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [isDarkMode, setIsDarkMode] = useState(true)
  const [audioFile, setAudioFile] = useState<File | null>(null)
  const [textFile, setTextFile] = useState<File | null>(null)
  const [videoId, setVideoId] = useState<string | null>(null)
  const searchParams = useSearchParams()

  const getVideoTitle = async (videoId: string) => {
    try {
      const response = await fetch(`https://noembed.com/embed?url=https://www.youtube.com/watch?v=${videoId}`);
      const data = await response.json();
      return data.title || 'Untitled Video';
    } catch (error) {
      console.error('Error fetching video title:', error);
      return 'Untitled Video';
    }
  };

  useEffect(() => {
    const handleVideoId = async () => {
      if (videoId) {
        // Add to recent videos
        const title = await getVideoTitle(videoId);
        const newRecent: RecentVideo = {
          id: videoId,
          timestamp: new Date().toISOString(),
          title: title
        };

        const recentVideos = JSON.parse(localStorage.getItem('recentYoutubeVideos') || '[]');
        const updated: RecentVideo[] = [newRecent, ...recentVideos.filter((v: RecentVideo) => v.id !== videoId)].slice(0, 10);
        localStorage.setItem('recentYoutubeVideos', JSON.stringify(updated));
      }
    }
    
    handleVideoId();
  }, [searchParams, getVideoTitle]);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen)
  }

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode)
  }

  const handleAudioUpload = (file: File) => {
    setAudioFile(file)
  }

  const handleTextUpload = (file: File) => {
    setTextFile(file)
  }
  
  return (
    <div className={`min-h-screen flex flex-col ${isDarkMode ? 'dark' : ''}`}>
      <TopBar 
        onToggleSidebar={toggleSidebar}
        onModeChange={setMode}
        onVideoIdChange={setVideoId}
      />
      <div className="flex flex-1">
        <Sidebar 
          isOpen={isSidebarOpen}
          onThemeToggle={toggleTheme}
          isDarkMode={isDarkMode}
          mode={mode}
          onModeChange={setMode}
          onAudioUpload={handleAudioUpload}
          onTextUpload={handleTextUpload}
        />
        <main className={`flex-1 pt-16 transition-all duration-300 ${isSidebarOpen ? 'ml-64' : 'ml-20'}`}>
          <div className="p-6">
            <div className="flex flex-col items-center">
              <div className="max-w-4xl w-full">
                {(mode === 'youtube' || mode === 'history' || mode === 'playlists') && (
                  <YoutubeMode initialVideoId={videoId} />
                )}
                {mode === 'editor' && (
                  <EditorMode 
                    audioFile={audioFile}
                    textFile={textFile}
                  />
                )}
                {mode === 'viewer' && (
                  <ViewerMode 
                    audioFile={audioFile}
                    textFile={textFile}
                  />
                )}
                {mode === 'history' && (
                  <HistoryPage 
                    onModeChange={setMode}
                    onVideoIdChange={setVideoId}
                  />
                )}
                {mode === 'playlists' && (
                  <PlaylistsPage 
                    onModeChange={setMode}
                    onVideoIdChange={setVideoId}
                  />
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}