"use client";

import React from 'react';
import { FaHome, FaUpload, FaHistory, FaRegPlayCircle, FaCog } from 'react-icons/fa';
import { MdOutlineLightMode, MdOutlineDarkMode } from 'react-icons/md';

interface SidebarProps {
  isOpen: boolean;
  onThemeToggle: () => void;
  isDarkMode: boolean;
}

const Sidebar = ({ isOpen, onThemeToggle, isDarkMode }: SidebarProps) => {
  const navItems = [
    { icon: <FaHome className="text-xl" />, label: 'Home', href: '/' },
    { icon: <FaUpload className="text-xl" />, label: 'Upload', href: '/upload' },
    { icon: <FaRegPlayCircle className="text-xl" />, label: 'Your Videos', href: '/videos' },
    { icon: <FaHistory className="text-xl" />, label: 'History', href: '/history', newTab: true },
  ];

  return (
    <div 
      className={`fixed top-16 left-0 h-[calc(100vh-4rem)] bg-white transition-all duration-300 ease-in-out ${
        isOpen ? 'w-64' : 'w-20'
      } border-r z-40`}
    >
      <div className="py-2">
        {navItems.map((item, index) => (
          <a
            key={index}
            href={item.href}
            target={item.newTab ? "_blank" : undefined}
            rel={item.newTab ? "noopener noreferrer" : undefined}
            className={`flex items-center px-3 py-3 hover:bg-gray-100 cursor-pointer ${
              isOpen ? 'gap-4' : 'justify-center'
            }`}
          >
            {item.icon}
            {isOpen && <span>{item.label}</span>}
          </a>
        ))}

        <div className="border-t mt-4 pt-4">
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
      </div>
    </div>
  );
};

export default Sidebar;