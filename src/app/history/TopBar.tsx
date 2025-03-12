'use client'

import React, { useRef } from 'react';
import { FaBars, FaSearch, FaVideo, FaBell, FaUserCircle, FaFileAudio, FaFileAlt, FaYoutube } from 'react-icons/fa';

interface TopBarProps {
  onToggleSidebar: () => void;
}

const TopBar = ({ 
  onToggleSidebar, 
}: TopBarProps) => {

  return (
    <div className="fixed top-0 left-0 right-0 h-16 bg-white dark:bg-gray-800 border-b dark:border-gray-700 flex items-center justify-between px-4 z-50">
      <div className="flex items-center gap-4">
        <button onClick={onToggleSidebar} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full">
          <FaBars className="text-xl text-white" />
        </button>
        <div className="flex items-center gap-1 cursor-pointer">
          <span className="text-xl font-bold text-white">Subtitle Maker</span>
        </div>
      </div>

      <div className="flex-1 max-w-2xl mx-4">
        <div className="relative">
          <input
            type="text"
            placeholder="Search..."
            className="w-full px-4 py-2 bg-gray-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <FaSearch className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
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