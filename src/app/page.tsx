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

export default function Home() {
  const [mode, setMode] = useState<'editor' | 'viewer' | 'youtube' | 'history' | 'playlists'>('youtube')
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [isDarkMode, setIsDarkMode] = useState(true)
  const [audioFile, setAudioFile] = useState<File | null>(null)
  const [textFile, setTextFile] = useState<File | null>(null)
  const [videoId, setVideoId] = useState<string | null>(null)
  const searchParams = useSearchParams()

  useEffect(() => {
    const urlVideoId = searchParams.get('video')
    if (urlVideoId) {
      setMode('youtube')
      setVideoId(urlVideoId)
    }
  }, [searchParams])

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
            {mode === 'editor' ? (
              <div className="flex flex-col items-center">
                <div className="max-w-4xl w-full">
                  <EditorMode 
                    audioFile={audioFile}
                    textFile={textFile}
                  />
                </div>
              </div>
            ) : mode === 'viewer' ? (
              <div className="flex flex-col items-center">
                <div className="max-w-4xl w-full">
                  <ViewerMode 
                    audioFile={audioFile}
                    textFile={textFile}
                  />
                </div>
              </div>
            ) : mode === 'youtube' ? (
              <div className="flex flex-col items-center">
                <div className="max-w-4xl w-full">
                  <YoutubeMode initialVideoId={videoId} />
                </div>
              </div>
            ) : mode === 'history' ? (
              <div className="flex flex-col items-center">
                <div className="max-w-4xl w-full">
                  <YoutubeMode initialVideoId={videoId} />
                </div>
                <div className="max-w-4xl w-full">
                  <HistoryPage />
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <div className="max-w-4xl w-full">
                  <YoutubeMode initialVideoId={videoId} />
                </div>
                <div className="max-w-4xl w-full">
                  <PlaylistsPage />
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}