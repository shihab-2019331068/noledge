import React, { useState } from 'react';

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className={`sidebar ${isOpen ? 'open' : ''}`}>
      <button onClick={toggleSidebar} className="toggle-button">
        ☰
      </button>
      <nav className="nav-items">
        <a href="#home">Home</a>
        <a href="#upload">Upload</a>
        <a href="#subscriptions">Subscriptions</a>
        <a href="#library">Library</a>
      </nav>
    </div>
  );
};

export default Sidebar; 