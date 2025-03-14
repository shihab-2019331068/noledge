'use client'

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FaBars, FaSearch, FaVideo, FaBell, FaUserCircle, FaFileAudio, FaFileAlt, FaYoutube } from 'react-icons/fa';

interface TopBarProps {
  onToggleSidebar: () => void;
  onPasteUrl?: (url: string) => void;
  onModeChange: (mode: 'editor' | 'viewer' | 'youtube' | 'history' | 'playlists') => void;
  onVideoIdChange: (id: string) => void;
}

const TopBar = ({ onToggleSidebar, onPasteUrl, onModeChange,
  onVideoIdChange }: TopBarProps) => {
  const [error, setError] = useState('');

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (!text) {
        setError('Clipboard is empty');
        return;
      }

      // Extract video ID from various YouTube URL formats
      let videoId = null;
      try {
        const url = new URL(text);
        if (url.hostname.includes('youtube.com')) {
          videoId = url.searchParams.get('v');
        } else if (url.hostname.includes('youtu.be')) {
          videoId = url.pathname.slice(1);
        }
      } catch (e) {
        // If it's not a URL, check if it's a direct video ID
        if (/^[a-zA-Z0-9_-]{11}$/.test(text)) {
          videoId = text;
        }
      }

      if (!videoId) {
        setError('Invalid YouTube URL or ID');
        return;
      }

      if (onPasteUrl) {
        onPasteUrl(text);
      }
      
      // Navigate to YouTube mode with the video ID
      
      onVideoIdChange(videoId);
      onModeChange('youtube');
      setError(''); // Clear any previous errors on success
    } catch (err) {
      setError('Failed to read from clipboard');
      console.error('Clipboard error:', err);
    }
  };

  return (
    <div className="fixed top-0 left-0 right-0 h-16 bg-white dark:bg-gray-800 border-b dark:border-gray-700 flex items-center justify-between px-4 z-50">
      {/* Left section */}
      <div className="flex items-center gap-4">
        <button onClick={onToggleSidebar} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full">
          <FaBars className="text-xl text-white" />
        </button>
        <div className="flex items-center gap-1 cursor-pointer">
          <FaFileAlt className="text-2xl text-white" />
          <span className="text-xl font-bold text-white">Subtitle Maker</span>
        </div>
      </div>

      {/* Middle section - Search */}
      <div className="flex-1 max-w-2xl mx-4">
        <div className="flex items-center w-full">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Search..."
              className="w-full h-8 px-4 bg-gray-100 dark:bg-gray-700 rounded-l-full focus:outline-none text-gray-800 dark:text-white"
            />
          </div>
          <button className="h-8 px-6 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-r-full">
            <FaSearch className="text-gray-600 dark:text-gray-300" />
          </button>
        </div>
      </div>

      {/* Right section */}
      <div className="flex items-center gap-2">
        <button
          onClick={handlePaste}
          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 flex items-center gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
            <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z" />
          </svg>
        </button>
        <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full">
          <FaVideo className="text-xl text-white" />
        </button>
        <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full">
          <FaBell className="text-xl text-white" />
        </button>
        <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full">
          <FaUserCircle className="text-xl text-white" />
        </button>
      </div>
      {error && (
        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 mb-2 px-4 py-2 bg-red-500 text-white rounded">
          {error}
        </div>
      )}
    </div>
  );
};

export default TopBar;