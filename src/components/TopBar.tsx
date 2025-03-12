'use client'

import React, { useRef } from 'react';
import { FaBars, FaSearch, FaVideo, FaBell, FaUserCircle, FaFileAudio, FaFileAlt, FaYoutube } from 'react-icons/fa';

interface TopBarProps {
  onToggleSidebar: () => void;
  mode: 'editor' | 'viewer' | 'youtube';
  onModeChange: (mode: 'editor' | 'viewer' | 'youtube') => void;
  onAudioUpload: (file: File) => void;
  onTextUpload: (file: File) => void;
}

const TopBar = ({ 
  onToggleSidebar, 
  mode, 
  onModeChange, 
  onAudioUpload, 
  onTextUpload 
}: TopBarProps) => {
  // Create refs for the file inputs
  const audioInputRef = useRef<HTMLInputElement>(null);
  const textInputRef = useRef<HTMLInputElement>(null);

  // Handlers to trigger the file inputs
  const triggerAudioUpload = () => {
    if (audioInputRef.current) {
      audioInputRef.current.click();
    }
  };

  const triggerTextUpload = () => {
    if (textInputRef.current) {
      textInputRef.current.click();
    }
  };

  const handleAudioFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onAudioUpload(file);
      // Reset the input so the same file can be selected again if needed
      e.target.value = '';
    }
  };

  const handleTextFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onTextUpload(file);
      // Reset the input so the same file can be selected again if needed
      e.target.value = '';
    }
  };

  return (
    <div className="fixed top-0 left-0 right-0 h-16 bg-white dark:bg-gray-800 border-b dark:border-gray-700 flex items-center px-4 z-50">
      <div className="flex items-center gap-4">
        <button onClick={onToggleSidebar} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full">
          <FaBars className="text-xl text-white" />
        </button>
        <div className="flex items-center gap-1 cursor-pointer">
          <span className="text-xl font-bold text-white">Subtitle Maker</span>
        </div>
      </div>
      
      <div className="flex-1 flex items-center justify-center gap-8">
        <div className="flex gap-2">
          <button
            onClick={() => onModeChange('editor')}
            className={`px-4 py-1.5 rounded-lg transition-colors ${
              mode === 'editor'
                ? 'bg-primary text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-white hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            Editor Mode
          </button>
          <button
            onClick={() => onModeChange('viewer')}
            className={`px-4 py-1.5 rounded-lg transition-colors ${
              mode === 'viewer'
                ? 'bg-primary text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-white hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            Viewer Mode
          </button>
          <button
            onClick={() => onModeChange('youtube')}
            className={`px-4 py-1.5 rounded-lg transition-colors flex items-center gap-2 ${
              mode === 'youtube'
                ? 'bg-red-600 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-white hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            <FaYoutube className="text-lg" />
            YouTube Mode
          </button>
        </div>

        <div className="flex gap-4">
          {/* Hidden file inputs */}
          <input
            ref={audioInputRef}
            type="file"
            accept="audio/*"
            onChange={handleAudioFileChange}
            className="hidden"
            id="audio-upload"
          />
          <input
            ref={textInputRef}
            type="file"
            accept=".srt,.txt"
            onChange={handleTextFileChange}
            className="hidden"
            id="text-upload"
          />
          
          {/* Only show upload buttons in editor mode */}
          {mode === 'editor' && (
            <>
              <button
                onClick={triggerAudioUpload}
                className="flex items-center gap-2 px-4 py-1.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                <FaFileAudio />
                <span>Upload Audio</span>
              </button>

              <button
                onClick={triggerTextUpload}
                className="flex items-center gap-2 px-4 py-1.5 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
              >
                <FaFileAlt />
                <span>Upload Text</span>
              </button>
            </>
          )}
        </div>
      </div>

      <div className="flex items-center gap-4">
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
    </div>
  );
};

export default TopBar;