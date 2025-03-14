"use client";

import React, {useRef} from 'react';
import { useRouter } from 'next/navigation';
import { FaHome, FaUpload, FaHistory, FaRegPlayCircle, FaCog, FaListUl, FaFileAudio, FaFileAlt, FaYoutube } from 'react-icons/fa';
import { MdOutlineLightMode, MdOutlineDarkMode } from 'react-icons/md';

interface SidebarProps {
  isOpen: boolean;
  onThemeToggle: () => void;
  isDarkMode: boolean;
  mode: 'editor' | 'viewer' | 'youtube' | 'history' | 'playlists';
  onModeChange: (mode: 'editor' | 'viewer' | 'youtube' | 'history' | 'playlists') => void;
  onAudioUpload: (file: File) => void;
  onTextUpload: (file: File) => void;
}

const Sidebar = ({ isOpen, onThemeToggle, isDarkMode, mode, onModeChange, onAudioUpload, onTextUpload }: SidebarProps) => {
  const router = useRouter();
  const navItems = [
    { icon: <FaHome className="text-xl" />, label: 'Home', href: '/' },
    { icon: <FaUpload className="text-xl" />, label: 'Upload', href: '/upload' },
    { icon: <FaRegPlayCircle className="text-xl" />, label: 'Your Videos', href: '/videos' },
    { icon: <FaListUl className="text-xl" />, label: 'Playlists', mode: 'playlists' },
    { icon: <FaHistory className="text-xl" />, label: 'History', mode: 'history' },
  ];

  // Create refs for the file inputs
  const audioInputRef = useRef<HTMLInputElement>(null);
  const textInputRef = useRef<HTMLInputElement>(null);

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

  const handleModeChange = (newMode: 'editor' | 'viewer' | 'youtube' | 'history' | 'playlists') => {
    onModeChange(newMode);
    router.push(`/`);
  };

  return (
    <div className={`fixed top-16 left-0 h-[calc(100vh-4rem)] bg-white transition-all duration-300 ease-in-out ${
      isOpen ? 'w-64' : 'w-20'
    } border-r z-40`}>
      <div className="flex flex-col h-full">
        {/* Main Navigation */}
        <div className="py-2">
          {navItems.map((item, index) => (
            item.href ? (
              <a
                key={index}
                href={item.href}
                className={`flex items-center px-3 py-3 hover:bg-gray-100 cursor-pointer ${
                  isOpen ? 'gap-4' : 'justify-center'
                }`}
              >
                {item.icon}
                {isOpen && <span>{item.label}</span>}
              </a>
            ) : (
              <button
                key={index}
                onClick={() => handleModeChange(item.mode as 'history' | 'playlists')}
                className={`w-full flex items-center px-3 py-3 hover:bg-gray-100 cursor-pointer ${
                  isOpen ? 'gap-4' : 'justify-center'
                } ${mode === item.mode ? 'text-primary' : ''}`}
              >
                {item.icon}
                {isOpen && <span>{item.label}</span>}
              </button>
            )
          ))}
        </div>

        {/* Mode Selection */}
        <div className="py-2 border-t">
          <button
            onClick={() => handleModeChange('editor')}
            className={`w-full flex items-center px-3 py-3 hover:bg-gray-100 cursor-pointer ${
              isOpen ? 'gap-4' : 'justify-center'
            } ${mode === 'editor' ? 'text-primary' : ''}`}
          >
            <FaFileAlt className="text-xl" />
            {isOpen && <span>Editor Mode</span>}
          </button>

          {/* Add upload buttons when in editor mode */}
          {mode === 'editor' && (
            <>
              <button
                onClick={triggerAudioUpload}
                className={`w-full flex items-center px-3 py-3 hover:bg-gray-100 cursor-pointer ${
                  isOpen ? 'gap-4 pl-8' : 'justify-center'
                }`}
              >
                <FaFileAudio className="text-xl" />
                {isOpen && <span>Upload Audio</span>}
              </button>
              <button
                onClick={triggerTextUpload}
                className={`w-full flex items-center px-3 py-3 hover:bg-gray-100 cursor-pointer ${
                  isOpen ? 'gap-4 pl-8' : 'justify-center'
                }`}
              >
                <FaFileAlt className="text-xl" />
                {isOpen && <span>Upload Text</span>}
              </button>
            </>
          )}

          <button
            onClick={() => handleModeChange('viewer')}
            className={`w-full flex items-center px-3 py-3 hover:bg-gray-100 cursor-pointer ${
              isOpen ? 'gap-4' : 'justify-center'
            } ${mode === 'viewer' ? 'text-primary' : ''}`}
          >
            <FaRegPlayCircle className="text-xl" />
            {isOpen && <span>Viewer Mode</span>}
          </button>
          <button
            onClick={() => handleModeChange('youtube')}
            className={`w-full flex items-center px-3 py-3 hover:bg-gray-100 cursor-pointer ${
              isOpen ? 'gap-4' : 'justify-center'
            } ${mode === 'youtube' ? 'text-red-600' : ''}`}
          >
            <FaYoutube className="text-xl" />
            {isOpen && <span>YouTube Mode</span>}
          </button>
        </div>

        {/* Bottom Section */}
        <div className="mt-auto border-t py-2">
          <button
            onClick={onThemeToggle}
            className={`w-full flex items-center px-3 py-3 hover:bg-gray-100 cursor-pointer ${
              isOpen ? 'gap-4' : 'justify-center'
            }`}
          >
            {isDarkMode ? (
              <MdOutlineLightMode className="text-xl" />
            ) : (
              <MdOutlineDarkMode className="text-xl" />
            )}
            {isOpen && <span>{isDarkMode ? 'Light Mode' : 'Dark Mode'}</span>}
          </button>
          
          <a
            href="/settings"
            className={`flex items-center px-3 py-3 hover:bg-gray-100 cursor-pointer ${
              isOpen ? 'gap-4' : 'justify-center'
            }`}
          >
            <FaCog className="text-xl" />
            {isOpen && <span>Settings</span>}
          </a>
        </div>

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
      </div>
    </div>
  );
};

export default Sidebar;