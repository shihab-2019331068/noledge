'use client'

import { useState, useRef, useEffect } from 'react'
import VideoPlayer from './VideoPlayer'
import { FaClock, FaSave, FaTimes } from 'react-icons/fa'
import { MdDownload, MdVisibility, MdVisibilityOff } from 'react-icons/md'

interface EditorModeProps {
  audioFile: File | null;
  textFile: File | null;
}

export default function EditorMode({ audioFile, textFile }: EditorModeProps = { audioFile: null, textFile: null }) {
  const [sentences, setSentences] = useState<string[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [result, setResult] = useState('')
  const audioRef = useRef<HTMLAudioElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [audioSrc, setAudioSrc] = useState<string | null>(null)
  const [showFeedback, setShowFeedback] = useState(false)
  const [feedbackMessage, setFeedbackMessage] = useState('')
  const [showPreview, setShowPreview] = useState(false)

  // Process text file when it changes
  useEffect(() => {
    if (textFile) {
      handleTextFileUpload(textFile);
    }
  }, [textFile]);

  // Process audio file when it changes
  useEffect(() => {
    if (audioFile) {
      const src = URL.createObjectURL(audioFile)
      setAudioSrc(src)
      
      // Clean up function to revoke object URL when component unmounts or audioFile changes
      return () => {
        if (src) URL.revokeObjectURL(src)
      }
    }
  }, [audioFile]);

  const showTemporaryFeedback = (message: string) => {
    setFeedbackMessage(message);
    setShowFeedback(true);
    setTimeout(() => setShowFeedback(false), 2000);
  };

  const handleTextFileUpload = (file: File) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const text = e.target?.result as string
      const newSentences = text.split(/[.!?,]+/).filter(s => s.trim())
      setSentences(newSentences)
      setCurrentIndex(0)
      if (newSentences.length > 0) {
        setResult('')
        showTemporaryFeedback(`Loaded ${newSentences.length} sentences`);
      }
    }
    reader.readAsText(file)
  }

  const handleNextSentence = () => {
    if (sentences.length === 0) return
    
    const newResult = result + `${formatTime(currentTime)} --> ${formatTime(currentTime + 3)}\n${sentences[currentIndex]}\n\n`
    setResult(newResult)
    
    setCurrentIndex((prev) => (prev + 1) % sentences.length)
  }

  const handlePreviousSentence = () => {
    if (sentences.length === 0 || currentIndex === 0 || result === '') return
    
    const newResult = result + `${formatTime(currentTime)} --> ${formatTime(currentTime + 3)}\n${sentences[currentIndex]}\n\n`
    setResult(newResult)
    
    // Decrement the current index
    setCurrentIndex((prev) => Math.max(0, prev - 1))
  }

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = Math.floor(seconds % 60)
    const ms = Math.floor((seconds % 1) * 1000)
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')},${String(ms).padStart(3, '0')}`
  }

  const formatDisplayTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
  }

  const handleDownload = () => {
    const blob = new Blob([result], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'subtitles.srt'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    showTemporaryFeedback('Downloaded subtitles');
  }

  const togglePreview = () => {
    setShowPreview(!showPreview);
    showTemporaryFeedback(showPreview ? 'Preview hidden' : 'Preview shown');
  }

  const handleTimeUpdate = (time: number) => {
    setCurrentTime(time)
  }

  return (
    <div className="space-y-6 w-full">
      {/* Feedback toast */}
      {showFeedback && (
        <div className="fixed top-4 right-4 z-50 bg-blue-600 text-white px-4 py-2 rounded-md shadow-lg animate-fadeIn">
          {feedbackMessage}
        </div>
      )}

      {/* Video player section */}
      <div className="relative w-full">
        <VideoPlayer 
          src={audioSrc}
          subtitleText={sentences[currentIndex] || ""}
          onTimeUpdate={handleTimeUpdate}
          onNextSubtitle={handleNextSentence}
          onPreviousSubtitle={handlePreviousSentence}
          onTogglePlay={(playing) => setIsPlaying(playing)}
          className="shadow-lg w-full"
        />
      </div>

      {/* Controls section */}
      <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
        {/* File info */}
        <div className="p-4 border rounded bg-gray-50 dark:bg-gray-800 dark:border-gray-700">
          <h3 className="font-medium mb-2 flex items-center text-white">
            <FaClock className="text-blue-600 mr-2" />
            Current Time: <span className="ml-2 font-bold">{formatTime(currentTime)}</span>
          </h3>
          <p className="text-sm text-white">Text: {textFile ? textFile.name : 'No file selected'}</p>
          <p className="text-sm text-white">Audio: {audioFile ? audioFile.name : 'No file selected'}</p>
          <p className="text-xs mt-2 text-white">Use the upload buttons in the top bar to change files.</p>
        </div>
      </div>

      {/* Progress indicator */}
      <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-2.5">
        <div 
          className="bg-blue-600 h-2.5 rounded-full transition-all duration-500" 
          style={{ width: `${sentences.length ? (currentIndex / sentences.length) * 100 : 0}%` }}
        ></div>
      </div>
      <div className="text-sm text-white text-center">
        {sentences.length > 0 ? `${currentIndex} of ${sentences.length} sentences processed (${Math.round((currentIndex / sentences.length) * 100)}%)` : 'No sentences loaded'}
      </div>

      {/* Subtitle generation area */}
      <div className="space-y-4 mt-6">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={togglePreview}
            className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-white rounded hover:bg-gray-300 dark:hover:bg-gray-600 flex items-center transition-colors"
          >
            {showPreview ? (
              <>
                <MdVisibilityOff className="mr-2" /> Hide Preview
              </>
            ) : (
              <>
                <MdVisibility className="mr-2" /> Show Preview
              </>
            )}
          </button>
          <button
            onClick={handleDownload}
            className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-white rounded hover:bg-gray-300 dark:hover:bg-gray-600 flex items-center transition-colors"
          >
            <MdDownload className="mr-2" /> Download
          </button>
          <button
            onClick={() => {
              if (window.confirm('Are you sure you want to clear all subtitles?')) {
                setResult('');
                showTemporaryFeedback('Cleared all subtitles');
              }
            }}
            className="px-4 py-2 bg-red-100 dark:bg-red-900 text-white rounded hover:bg-red-200 dark:hover:bg-red-800 flex items-center ml-auto transition-colors"
          >
            <FaTimes className="mr-2" /> Clear All
          </button>
        </div>
        {showPreview && (
          <pre className="p-4 bg-gray-50 dark:bg-gray-800 rounded overflow-auto max-h-[400px] w-full border dark:border-gray-700 text-white">
            {result || "Generated subtitles will appear here."}
          </pre>
        )}
      </div>
    </div>
  )
} 