'use client'

import React, { useState, useRef, useEffect } from 'react'
import VideoPlayer from './VideoPlayer'

interface Subtitle {
  startTime: number
  endTime: number
  text: string
}

interface ViewerModeProps {
  audioFile: File | null
  textFile: File | null
}

export default function ViewerMode({ audioFile, textFile }: ViewerModeProps) {
  const [subtitles, setSubtitles] = useState<Subtitle[]>([])
  const [currentSubtitle, setCurrentSubtitle] = useState<string>('')
  const [currentSubtitleIndex, setCurrentSubtitleIndex] = useState<number>(-1)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isTheaterMode, setIsTheaterMode] = useState(false)
  const audioRef = useRef<HTMLAudioElement>(null)
  const playerContainerRef = useRef<HTMLDivElement>(null)
  const [audioSrc, setAudioSrc] = useState<string | null>(null)

  useEffect(() => {
    if (audioFile) {
      const src = URL.createObjectURL(audioFile)
      setAudioSrc(src)
    }
  }, [audioFile])

  useEffect(() => {
    if (textFile) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const text = e.target?.result as string
        const parsedSubtitles = parseSubtitles(text)
        setSubtitles(parsedSubtitles)
      }
      reader.readAsText(textFile)
    }
  }, [textFile])

  const parseSubtitles = (content: string): Subtitle[] => {
    const lines = content.trim().split('\n')
    const subtitles: Subtitle[] = []
    
    for (let i = 0; i < lines.length; i++) {
      const timeLine = lines[i]
      if (timeLine.includes('-->')) {
        const [start, end] = timeLine.split('-->').map(t => timeToSeconds(t.trim()))
        const text = lines[i + 1]
        if (text) {
          subtitles.push({ startTime: start, endTime: end, text: text.trim() })
        }
        i++ // Skip the text line
      }
    }
    
    return subtitles
  }

  const timeToSeconds = (timeStr: string): number => {
    const [time, ms] = timeStr.split(',')
    const [hours, minutes, seconds] = time.split(':').map(Number)
    return hours * 3600 + minutes * 60 + seconds + Number(ms) / 1000
  }

  const updateSubtitle = (currentTime: number) => {
    const subtitleIndex = subtitles.findIndex(
      sub => currentTime >= sub.startTime && currentTime <= sub.endTime
    )

    if (subtitleIndex !== -1) {
      setCurrentSubtitle(subtitles[subtitleIndex].text || '')
      setCurrentSubtitleIndex(subtitleIndex)
    } else {
      setCurrentSubtitle('')
      const nextSubtitleIndex = subtitles.findIndex(sub => currentTime < sub.startTime)
      if (nextSubtitleIndex !== -1) {
        setCurrentSubtitleIndex(nextSubtitleIndex - 1)
      }
    }
  }

  const goToNextSentence = () => {
    if (currentSubtitleIndex === -1 || currentSubtitleIndex >= subtitles.length - 1) return
    
    const nextSubtitle = subtitles[currentSubtitleIndex + 1]
    if (nextSubtitle && audioRef.current) {
      audioRef.current.currentTime = nextSubtitle.startTime
    }
  }

  const handleTogglePlay = (playing: boolean) => {
    setIsPlaying(playing)
  }

  const toggleTheaterMode = () => {
    setIsTheaterMode(!isTheaterMode)
  }

  return (
    <div className="space-y-6 w-full">
      <div className={isTheaterMode ? 'fixed inset-0 z-50 bg-black flex items-center justify-center' : 'relative w-full'}>
        <VideoPlayer 
          src={audioSrc}
          subtitleText={currentSubtitle}
          onTimeUpdate={updateSubtitle}
          onTogglePlay={handleTogglePlay}
          className={isTheaterMode ? 'aspect-video shadow-2xl' : 'shadow-lg w-full'}
        />
      </div>

      {!isTheaterMode && (
        <div className="p-4 border rounded bg-gray-50 dark:bg-gray-800 dark:border-gray-700 w-full max-h-[400px] overflow-auto">
          <h3 className="font-medium mb-2 text-white">Subtitles:</h3>
          <div className="space-y-2">
            {subtitles.map((subtitle, index) => (
              <div 
                key={index}
                className={`p-2 rounded text-sm text-white ${index === currentSubtitleIndex ? 'bg-blue-100 dark:bg-blue-900 border-l-4 border-blue-500' : 'bg-white dark:bg-gray-700'}`}
              >
                {subtitle.text}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
} 