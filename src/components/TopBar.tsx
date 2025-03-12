'use client'

import React, { useRef } from 'react';
import { FaBars, FaSearch, FaVideo, FaBell, FaUserCircle, FaFileAudio, FaFileAlt, FaYoutube } from 'react-icons/fa';

interface TopBarProps {
  onToggleSidebar: () => void;
}

const TopBar = ({ onToggleSidebar }: TopBarProps) => {
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