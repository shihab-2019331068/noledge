'use client'

import React, { useState, useRef, useEffect, useCallback } from 'react'
import { FaPlay, FaPause, FaVolumeUp, FaVolumeMute, FaExpand, FaCompress } from 'react-icons/fa'
import { BiRewind, BiFastForward } from 'react-icons/bi'
import { MdSubtitles } from 'react-icons/md'

interface VideoPlayerProps {
  src: string | null
  subtitleText?: string
  onTimeUpdate?: (time: number) => void
  onNextSubtitle?: () => void
  onPreviousSubtitle?: () => void
  onTogglePlay?: (isPlaying: boolean) => void
  className?: string
  thumbnailImage?: string
}

// Utility functions
const formatTime = (timeInSeconds: number): string => {
  const hours = Math.floor(timeInSeconds / 3600)
  const minutes = Math.floor((timeInSeconds % 3600) / 60)
  const seconds = Math.floor(timeInSeconds % 60)
  
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
  }
  
  return `${minutes}:${seconds.toString().padStart(2, '0')}`
}

export default function VideoPlayer({
  src,
  subtitleText = '',
  onTimeUpdate,
  onNextSubtitle,
  onPreviousSubtitle,
  onTogglePlay,
  className = '',
  thumbnailImage,
}: VideoPlayerProps) {
  // Media state
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [volume, setVolume] = useState(1)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [playbackRate, setPlaybackRate] = useState(1)
  
  // UI state
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [showControls, setShowControls] = useState(true)
  const [showSubtitles, setShowSubtitles] = useState(true)
  const [showVolumeSlider, setShowVolumeSlider] = useState(false)
  
  // Refs
  const mediaRef = useRef<HTMLVideoElement>(null)
  const playerContainerRef = useRef<HTMLDivElement>(null)
  const controlsTimerRef = useRef<NodeJS.Timeout | null>(null)
  const lastTapTimeRef = useRef<number>(0)
  const tapTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (src && mediaRef.current) mediaRef.current.src = src
  }, [src])

  useEffect(() => {
    const media = mediaRef.current
    if (!media) return

    // Event handlers
    const handlers = {
      play: () => {
        setIsPlaying(true)
        if (onTogglePlay) onTogglePlay(true)
      },
      pause: () => {
        setIsPlaying(false)
        if (onTogglePlay) onTogglePlay(false)
      },
      timeupdate: () => {
        setCurrentTime(media.currentTime)
        if (onTimeUpdate) onTimeUpdate(media.currentTime)
      },
      durationchange: () => setDuration(media.duration),
      volumechange: () => {
        setVolume(media.volume)
        setIsMuted(media.muted)
      },
      ended: () => {
        setIsPlaying(false)
        if (onTogglePlay) onTogglePlay(false)
      }
    }

    // Add all event listeners
    Object.entries(handlers).forEach(([event, handler]) => {
      media.addEventListener(event, handler)
    })

    // Add keyboard control for next subtitle
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' && onNextSubtitle) {
        onNextSubtitle();
      } else if (e.key === 'ArrowLeft') {
        if (onPreviousSubtitle) {
          onPreviousSubtitle();
        } else {
          mediaControls.skipBackward();
        }
      } else if (e.key === 'Space') {
        e.preventDefault();
        mediaControls.togglePlay();
      } else if (e.key === '>' && e.shiftKey) {
        // Increase playback speed by 0.25x
        mediaControls.adjustPlaybackRate(0.25);
      } else if (e.key === '<' && e.shiftKey) {
        // Decrease playback speed by 0.25x
        mediaControls.adjustPlaybackRate(-0.25);
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    // Add wheel event listener for previous/next subtitle
    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      if (e.deltaY < 0 && onPreviousSubtitle) {
        onPreviousSubtitle();
      } else if (e.deltaY > 0 && onNextSubtitle) {
        onNextSubtitle();
      }
    };

    const videoElement = mediaRef.current;
    if (videoElement) {
      videoElement.addEventListener('wheel', handleWheel);
    }

    // Cleanup
    return () => {
      Object.entries(handlers).forEach(([event, handler]) => {
        if (media) {
          media.removeEventListener(event, handler)
        }
      })
      window.removeEventListener('keydown', handleKeyDown);
      if (videoElement) {
        videoElement.removeEventListener('wheel', handleWheel);
      }
    }
  }, [onTimeUpdate, onTogglePlay, onNextSubtitle, onPreviousSubtitle])

  // Fullscreen change effect
  useEffect(() => {
    const handleFullscreenChange = () => setIsFullscreen(!!document.fullscreenElement)
    document.addEventListener('fullscreenchange', handleFullscreenChange)
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange)
  }, [])

  // Handle mouse movement to show controls and set up auto-hide timer
  const handleMouseMove = useCallback(() => {
    setShowControls(true)
    
    // Clear any existing timer
    if (controlsTimerRef.current) {
      clearTimeout(controlsTimerRef.current)
    }
    
    // Set a new timer to hide controls after 3 seconds of inactivity
    controlsTimerRef.current = setTimeout(() => {
      if (isPlaying) {
        setShowControls(false)
      }
    }, 3000)
  }, [isPlaying])
  
  // Set up the auto-hide timer effect
  useEffect(() => {
    // Clean up timer on unmount
    return () => {
      if (controlsTimerRef.current) {
        clearTimeout(controlsTimerRef.current)
      }
    }
  }, [])
  
  // Update timer when play state changes
  useEffect(() => {
    if (isPlaying) {
      // Start the timer to hide controls
      handleMouseMove()
    } else {
      // When paused, always show controls
      setShowControls(true)
      // Clear any existing timer
      if (controlsTimerRef.current) {
        clearTimeout(controlsTimerRef.current)
      }
    }
  }, [isPlaying, handleMouseMove])

  // Double tap detection with improved handling
  const handleVideoTap = (e: React.MouseEvent) => {
    const currentTime = new Date().getTime()
    const tapLength = currentTime - lastTapTimeRef.current
    
    mediaControls.togglePlay()
    
    if (tapLength < 300 && tapLength > 0) {
      // Double tap detected
      mediaControls.toggleFullscreen()
      mediaControls.togglePlay()
    }
    
    lastTapTimeRef.current = currentTime
  }

  // Clean up tap timeout on unmount
  useEffect(() => {
    return () => {
      if (tapTimeoutRef.current) {
        clearTimeout(tapTimeoutRef.current)
      }
    }
  }, [])

  // Media control functions
  const mediaControls = {
    togglePlay: () => {
      const media = mediaRef.current
      if (!media) return
      isPlaying ? media.pause() : media.play()
    },
    
    toggleMute: () => {
      const media = mediaRef.current
      if (!media) return
      media.muted = !isMuted
    },
    
    handleVolumeChange: (e: React.ChangeEvent<HTMLInputElement>) => {
      const newVolume = parseFloat(e.target.value)
      const media = mediaRef.current
      if (media) {
        media.volume = newVolume
        media.muted = newVolume === 0
      }
    },
    
    handleSeek: (e: React.ChangeEvent<HTMLInputElement>) => {
      const newTime = parseFloat(e.target.value)
      if (mediaRef.current) mediaRef.current.currentTime = newTime
      setCurrentTime(newTime)
    },
    
    skipBackward: () => {
      if (!mediaRef.current) return
      mediaRef.current.currentTime = Math.max(0, currentTime - 10)
    },
    
    skipForward: () => {
      if (!mediaRef.current) return
      mediaRef.current.currentTime = Math.min(duration, currentTime + 10)
    },
    
    toggleFullscreen: () => {
      const player = playerContainerRef.current
      if (!player) return
      
      if (!isFullscreen) {
        player.requestFullscreen().catch(err => {
          console.error('Error attempting to enable fullscreen:', err)
        })
      } else {
        document.exitFullscreen()
      }
    },
    
    handlePreviousSubtitle: () => {
      if (onPreviousSubtitle) onPreviousSubtitle()
    },
    
    handleNextSubtitle: () => {
      if (onNextSubtitle) onNextSubtitle()
    },
    
    toggleSubtitles: () => setShowSubtitles(!showSubtitles),
    
    adjustPlaybackRate: (change: number) => {
      if (!mediaRef.current) return
      
      // Limit playback rate between 0.25 and 2.0
      const newRate = Math.max(0.25, Math.min(2.0, playbackRate + change))
      mediaRef.current.playbackRate = newRate
      setPlaybackRate(newRate)
    }
  }

  return (
    <div className={`relative w-full bg-black overflow-hidden ${className}`}>
      <div 
        ref={playerContainerRef}
        className="group relative aspect-video"
        onMouseMove={handleMouseMove}
        onContextMenu={(e) => {
          e.preventDefault();
          if (onNextSubtitle) onNextSubtitle();
        }}
      >
        <video
          ref={mediaRef}
          src={src || undefined}
          className="w-full h-full object-contain opacity-80 relative z-10"
          poster={thumbnailImage}
          style={{ opacity: showControls || !isPlaying ? 1 : 0.95 }}
          onClick={handleVideoTap}
        />
        
        {/* Lyrics-style Subtitle Display */}
        {showSubtitles && subtitleText && (
          <div className="absolute inset-y-0 inset-x-0 flex flex-col justify-center items-center z-30 pointer-events-none">
            <div className="text-center px-8 py-4 max-w-[90%]">
              <span className="text-4xl md:text-5xl font-bold text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] leading-relaxed tracking-wide">
                {subtitleText}
              </span>
            </div>
          </div>
        )}

        {/* Controls Overlay */}
        <div 
          className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent pt-10 pb-2 px-4 transition-opacity duration-300 z-40 ${showControls ? 'opacity-100' : 'opacity-0'}`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Progress Bar */}
          <div className="relative w-full h-1 mb-2 group cursor-pointer bg-gray-600">
            <div className="absolute top-0 left-0 h-full bg-red-600 pointer-events-none" style={{ width: `${(currentTime / duration) * 100}%` }} />
            
            {/* Keep the input range for accessibility */}
            <input 
              type="range"
              min="0"
              max={duration || 100}
              value={currentTime}
              onChange={mediaControls.handleSeek}
              className="absolute top-0 left-0 w-full h-full opacity-0 cursor-pointer"
              style={{ touchAction: 'none' }}
            />
          </div>
          
          {/* Controls Row */}
          <div className="flex items-center justify-between">
            {/* Left Controls */}
            <div className="flex items-center space-x-3">
              <button onClick={mediaControls.togglePlay} className="text-white hover:text-gray-300" aria-label={isPlaying ? "Pause" : "Play"}>
                {isPlaying ? <FaPause size={18} /> : <FaPlay size={18} />}
              </button>
              <button onClick={mediaControls.skipBackward} className="text-white hover:text-gray-300" aria-label="Rewind 10 seconds">
                <BiRewind size={20} />
              </button>
              <button onClick={mediaControls.skipForward} className="text-white hover:text-gray-300" aria-label="Forward 10 seconds">
                <BiFastForward size={20} />
              </button>
              
              {/* Next Button - Only show if onNextSubtitle is provided */}
              {onNextSubtitle && (
                <>
                  <button 
                    onClick={mediaControls.handlePreviousSubtitle}
                    className="text-white hover:text-gray-300" 
                    aria-label="Previous subtitle"
                    title="Previous subtitle (Left Arrow or Scroll Up)"
                  >
                    <MdSubtitles size={20} className="transform rotate-180" />
                  </button>
                  <button 
                    onClick={mediaControls.handleNextSubtitle} 
                    className="text-white hover:text-gray-300" 
                    aria-label="Next subtitle"
                    title="Next subtitle (Right Arrow or Scroll Down)"
                  >
                    <MdSubtitles size={20} />
                  </button>
                </>
              )}
              
              {/* Volume Control */}
              <div className="relative flex items-center group" onMouseEnter={() => setShowVolumeSlider(true)} onMouseLeave={() => setShowVolumeSlider(false)}>
                <button onClick={mediaControls.toggleMute} className="text-white hover:text-gray-300 mr-2" aria-label={isMuted ? "Unmute" : "Mute"}>
                  {isMuted ? <FaVolumeMute size={18} /> : <FaVolumeUp size={18} />}
                </button>
                <div className={`absolute left-8 bottom-0 w-24 h-10 flex items-center bg-black/90 rounded px-3 ${showVolumeSlider ? 'opacity-100' : 'opacity-0'} transition-opacity`}>
                  <input 
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={volume}
                    onChange={mediaControls.handleVolumeChange}
                    className="w-full h-1 bg-gray-500 rounded-full appearance-none"
                  />
                </div>
              </div>
              
              {/* Time Display */}
              <div className="text-white text-sm">
                <span>{formatTime(currentTime)}</span>
                <span className="mx-1">/</span>
                <span>{formatTime(duration)}</span>
              </div>
              
              {/* Playback Rate Display */}
              <div className="text-white text-sm ml-2">
                <span>{playbackRate.toFixed(2)}x</span>
              </div>
            </div>
            
            {/* Right Controls */}
            <div className="flex items-center space-x-3">
              {subtitleText && (
                <button onClick={mediaControls.toggleSubtitles} className={`text-white hover:text-gray-300 ${showSubtitles ? 'text-blue-400' : ''}`} aria-label={showSubtitles ? "Hide subtitles" : "Show subtitles"}>
                  <MdSubtitles size={20} />
                </button>
              )}
              
              {/* Fullscreen Toggle */}
              <button onClick={mediaControls.toggleFullscreen} className="text-white hover:text-gray-300" aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}>
                {isFullscreen ? <FaCompress size={18} /> : <FaExpand size={18} />}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 