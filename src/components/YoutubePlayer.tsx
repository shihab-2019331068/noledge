import React, { useState, useRef, useEffect } from 'react';

interface YouTubePlayerProps {
  videoSrc: string;
  posterSrc?: string;
  title?: string;
  channelName?: string;
  viewCount?: string;
  uploadDate?: string;
  mode?: 'editor' | 'viewer' | 'youtube';
  youtubeVideoId?: string;
}

const YouTubePlayer: React.FC<YouTubePlayerProps> = ({
  videoSrc,
  posterSrc,
  title = "Video Title",
  channelName = "Channel Name",
  viewCount = "1M views",
  uploadDate = "1 month ago",
  mode = 'viewer',
  youtubeVideoId
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(100);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [isTheaterMode, setIsTheaterMode] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [isLiked, setIsLiked] = useState(false);
  const [isDisliked, setIsDisliked] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const playerRef = useRef<HTMLDivElement>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  useEffect(() => {
    if (mode === 'youtube') return;
    
    const video = videoRef.current;
    if (!video) return;
    
    const updateDuration = () => {
      setDuration(video.duration);
    };
    
    const updateTime = () => {
      setCurrentTime(video.currentTime);
    };
    
    video.addEventListener('loadedmetadata', updateDuration);
    video.addEventListener('timeupdate', updateTime);
    
    return () => {
      video.removeEventListener('loadedmetadata', updateDuration);
      video.removeEventListener('timeupdate', updateTime);
    };
  }, [mode]);
  
  useEffect(() => {
    if (mode === 'youtube') return;
    
    const video = videoRef.current;
    if (!video) return;
    
    if (isPlaying) {
      video.play().catch(() => setIsPlaying(false));
    } else {
      video.pause();
    }
  }, [isPlaying, mode]);
  
  useEffect(() => {
    if (mode === 'youtube') return;
    
    const video = videoRef.current;
    if (!video) return;
    
    video.volume = isMuted ? 0 : volume / 100;
  }, [volume, isMuted, mode]);
  
  useEffect(() => {
    if (mode === 'youtube') return;
    
    const video = videoRef.current;
    if (!video) return;
    
    video.playbackRate = playbackSpeed;
  }, [playbackSpeed, mode]);
  
  const getYouTubeVideoId = () => {
    if (youtubeVideoId) return youtubeVideoId;
    
    try {
      const url = new URL(videoSrc);
      if (url.hostname.includes('youtube.com')) {
        return url.searchParams.get('v') || '';
      } else if (url.hostname.includes('youtu.be')) {
        return url.pathname.slice(1);
      }
    } catch (e) {
      return '';
    }
    
    return '';
  };
  
  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };
  
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseInt(e.target.value);
    setVolume(newVolume);
    if (newVolume === 0) {
      setIsMuted(true);
    } else if (isMuted) {
      setIsMuted(false);
    }
  };
  
  const toggleMute = () => {
    setIsMuted(!isMuted);
  };
  
  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const video = videoRef.current;
    if (!video) return;
    
    const seekTime = parseFloat(e.target.value);
    video.currentTime = seekTime;
    setCurrentTime(seekTime);
  };
  
  const toggleFullscreen = () => {
    if (!playerRef.current) return;
    
    if (!document.fullscreenElement) {
      playerRef.current.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable full-screen mode: ${err.message}`);
      });
    } else {
      document.exitFullscreen();
    }
  };
  
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);
  
  const handlePlayerMouseMove = () => {
    setShowControls(true);
    
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    
    if (isPlaying) {
      controlsTimeoutRef.current = setTimeout(() => {
        setShowControls(false);
      }, 3000);
    }
  };
  
  const toggleTheaterMode = () => {
    setIsTheaterMode(!isTheaterMode);
  };
  
  const toggleSettings = () => {
    setShowSettings(!showSettings);
  };
  
  const formatTime = (timeInSeconds: number) => {
    const hours = Math.floor(timeInSeconds / 3600);
    const minutes = Math.floor((timeInSeconds % 3600) / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };
  
  const toggleLike = () => {
    if (isLiked) {
      setIsLiked(false);
    } else {
      setIsLiked(true);
      setIsDisliked(false);
    }
  };
  
  const toggleDislike = () => {
    if (isDisliked) {
      setIsDisliked(false);
    } else {
      setIsDisliked(true);
      setIsLiked(false);
    }
  };
  
  const renderVideoPlayer = () => {
    if (mode === 'youtube') {
      const videoId = getYouTubeVideoId();
      if (!videoId) {
        return (
          <div className="w-full h-full flex items-center justify-center bg-black text-white">
            <p>Invalid YouTube URL or ID</p>
          </div>
        );
      }
      
      return (
        <iframe 
          src={`https://www.youtube.com/embed/${videoId}?autoplay=0&rel=0`}
          className="w-full h-full"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          title={title}
        ></iframe>
      );
    } else {
      return (
        <>
          <video
            ref={videoRef}
            src={videoSrc}
            poster={posterSrc}
            className="w-full h-full object-contain"
            onClick={togglePlay}
          />
          
          {!isPlaying && (
            <div className="absolute inset-0 flex items-center justify-center">
              <button 
                className="bg-black bg-opacity-70 rounded-full w-16 h-16 flex items-center justify-center text-white"
                onClick={togglePlay}
              >
                <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </button>
            </div>
          )}
          
          <div 
            className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-2 transition-opacity duration-300 ${
              showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'
            }`}
          >
            <div className="mb-2 px-2">
              <input
                type="range"
                min="0"
                max={duration || 100}
                value={currentTime}
                onChange={handleSeek}
                className="w-full h-1 bg-gray-600 rounded-full appearance-none cursor-pointer"
                style={{
                  background: `linear-gradient(to right, red ${(currentTime / (duration || 1)) * 100}%, rgba(255, 255, 255, 0.3) ${(currentTime / (duration || 1)) * 100}%)`
                }}
              />
            </div>
            
            <div className="flex items-center justify-between px-2">
              <div className="flex items-center space-x-4">
                <button className="text-white" onClick={togglePlay}>
                  {isPlaying ? (
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
                    </svg>
                  ) : (
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  )}
                </button>
                
                <div className="flex items-center space-x-1">
                  <button className="text-white" onClick={toggleMute}>
                    {isMuted || volume === 0 ? (
                      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z" />
                      </svg>
                    ) : volume < 50 ? (
                      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M7 9v6h4l5 5V4l-5 5H7z" />
                      </svg>
                    ) : (
                      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
                      </svg>
                    )}
                  </button>
                  <div className="w-16 hidden sm:block">
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={isMuted ? 0 : volume}
                      onChange={handleVolumeChange}
                      className="w-full h-1 bg-gray-600 rounded-full appearance-none cursor-pointer"
                      style={{
                        background: `linear-gradient(to right, white ${isMuted ? 0 : volume}%, rgba(255, 255, 255, 0.3) ${isMuted ? 0 : volume}%)`
                      }}
                    />
                  </div>
                </div>
                
                <div className="text-white text-sm">
                  {formatTime(currentTime)} / {formatTime(duration || 0)}
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <button className="text-white" onClick={toggleSettings}>
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z" />
                    </svg>
                  </button>
                  
                  {showSettings && (
                    <div className="absolute bottom-full right-0 mb-2 w-48 bg-black bg-opacity-90 rounded shadow-lg p-2">
                      <div className="text-white text-sm p-2">
                        <p className="font-medium mb-1">Playback Speed</p>
                        {[0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2].map(speed => (
                          <button
                            key={speed}
                            className={`block w-full text-left py-1 px-2 rounded ${playbackSpeed === speed ? 'bg-blue-500' : 'hover:bg-gray-700'}`}
                            onClick={() => {
                              setPlaybackSpeed(speed);
                              setShowSettings(false);
                            }}
                          >
                            {speed === 1 ? 'Normal' : `${speed}x`}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                
                <button className="text-white" onClick={toggleTheaterMode}>
                  {isTheaterMode ? (
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M19 7H5c-1.1 0-2 .9-2 2v6c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V9c0-1.1-.9-2-2-2zm0 8H5V9h14v6z" />
                    </svg>
                  ) : (
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M19 4H5c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 14H5V6h14v12z" />
                    </svg>
                  )}
                </button>
                
                <button className="text-white" onClick={toggleFullscreen}>
                  {isFullscreen ? (
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M5 16h3v3h2v-5H5v2zm3-8H5v2h5V5H8v3zm6 11h2v-3h3v-2h-5v5zm2-11V5h-2v5h5V8h-3z" />
                    </svg>
                  ) : (
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>
          </div>
        </>
      );
    }
  };
  
  return (
    <div className="flex flex-col w-full max-w-4xl">
      <div 
        ref={playerRef} 
        className={`relative bg-black overflow-hidden ${isTheaterMode ? 'w-full h-96' : 'aspect-video'}`}
        onMouseMove={mode !== 'youtube' ? handlePlayerMouseMove : undefined}
        onMouseLeave={mode !== 'youtube' && isPlaying ? () => setShowControls(false) : undefined}
      >
        {renderVideoPlayer()}
      </div>
      
      <div className="py-3 px-4">
        <h1 className="text-xl font-bold mb-2">{title}</h1>
        <div className="flex flex-wrap justify-between items-center mb-3">
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-full bg-gray-300 mr-3"></div>
            <div>
              <div className="font-medium">{channelName}</div>
              <div className="text-sm text-gray-500">1.2M subscribers</div>
            </div>
            <button className="ml-4 bg-red-600 text-white px-4 py-2 rounded-full font-medium">
              Subscribe
            </button>
          </div>
          
          <div className="flex items-center space-x-2 mt-2 sm:mt-0">
            <div className="flex items-center bg-gray-100 rounded-full overflow-hidden">
              <button 
                className={`flex items-center px-4 py-2 ${isLiked ? 'text-blue-600' : ''}`}
                onClick={toggleLike}
              >
                <svg className="w-5 h-5 mr-1" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M1 21h4V9H1v12zm22-11c0-1.1-.9-2-2-2h-6.31l.95-4.57.03-.32c0-.41-.17-.79-.44-1.06L14.17 1 7.59 7.59C7.22 7.95 7 8.45 7 9v10c0 1.1.9 2 2 2h9c.83 0 1.54-.5 1.84-1.22l3.02-7.05c.09-.23.14-.47.14-.73v-2z" />
                </svg>
                123K
              </button>
              <div className="w-px h-6 bg-gray-300"></div>
              <button 
                className={`flex items-center px-4 py-2 ${isDisliked ? 'text-blue-600' : ''}`}
                onClick={toggleDislike}
              >
                <svg className="w-5 h-5 mr-1" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M15 3H6c-.83 0-1.54.5-1.84 1.22l-3.02 7.05c-.09.23-.14.47-.14.73v2c0 1.1.9 2 2 2h6.31l-.95 4.57-.03.32c0 .41.17.79.44 1.06L9.83 23l6.59-6.59c.36-.36.58-.86.58-1.41V5c0-1.1-.9-2-2-2zm4 0v12h4V3h-4z" />
                </svg>
                Dislike
              </button>
            </div>
            
            <button className="flex items-center px-3 py-2 bg-gray-100 rounded-full">
              <svg className="w-5 h-5 mr-1" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92 1.61 0 2.92-1.31 2.92-2.92s-1.31-2.92-2.92-2.92z" />
              </svg>
              Share
            </button>
            
            <button className="flex items-center px-3 py-2 bg-gray-100 rounded-full">
              <svg className="w-5 h-5 mr-1" fill="currentColor" viewBox="0 0 24 24">
                <path d="M14 10H2v2h12v-2zm0-4H2v2h12V6zm4 8v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zM2 16h8v-2H2v2z" />
              </svg>
              Save
            </button>
          </div>
        </div>
        
        <div className="bg-gray-100 p-3 rounded-lg">
          <div className="flex items-center text-sm text-gray-600 mb-2">
            <span className="mr-2">{viewCount}</span>
            <span className="mr-2">{uploadDate}</span>
          </div>
          <p className="text-sm line-clamp-2">
            This is a description of the video. It could include details about the content, 
            links to resources mentioned in the video, timestamps for different sections, etc.
          </p>
          <button className="text-sm font-medium mt-1">SHOW MORE</button>
        </div>
      </div>
    </div>
  );
};

export default YouTubePlayer;