'use client'

import { useState } from 'react'
import EditorMode from '@/components/EditorMode'
import ViewerMode from '@/components/ViewerMode'
import Sidebar from '@/components/Sidebar'
import TopBar from '@/components/TopBar'
import YoutubePlayer from '@/components/YoutubePlayer'

export default function Home() {
  const [mode, setMode] = useState<'editor' | 'viewer' | 'youtube'>('editor')
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [isDarkMode, setIsDarkMode] = useState(true)
  const [audioFile, setAudioFile] = useState<File | null>(null)
  const [textFile, setTextFile] = useState<File | null>(null)
  const [youtubeVideoId, setYoutubeVideoId] = useState<string>('')

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
        mode={mode}
        onModeChange={setMode}
        onAudioUpload={handleAudioUpload}
        onTextUpload={handleTextUpload}
      />
      <div className="flex flex-1">
        <Sidebar 
          isOpen={isSidebarOpen}
          onThemeToggle={toggleTheme}
          isDarkMode={isDarkMode}
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
            ) : (
              <div className="flex flex-col items-center">
                <div className="max-w-4xl w-full">
                  <YoutubePlayer 
                    videoSrc=""
                    mode="youtube"
                    youtubeVideoId={youtubeVideoId || "dQw4w9WgXcQ"}
                  />
                  <div className="mt-4">
                    <input
                      type="text"
                      value={youtubeVideoId}
                      onChange={(e) => setYoutubeVideoId(e.target.value)}
                      placeholder="Enter YouTube Video ID"
                      className="p-2 border rounded w-full"
                    />
                    <p className="text-sm text-gray-500 mt-2">
                      Enter a YouTube video ID to watch and create subtitles for it
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  )
} 