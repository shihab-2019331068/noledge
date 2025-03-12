import React from 'react';
import { useRouter } from 'next/navigation';

interface TileProps {
  id: string;
  title: string;
  onVideoClick: (id: string) => void;
  onAddToPlaylist: (id: string) => void;
}

const Tile: React.FC<TileProps> = ({ id, title, onVideoClick, onAddToPlaylist }) => {
  const router = useRouter();

  const handleClick = (id: string) => {
    router.push(`/?video=${id}`);
  };

  return (
    <div className="flex justify-between items-center p-2 bg-white dark:bg-gray-800 rounded-lg shadow-md mb-2 hover:shadow-lg transition-shadow">
      <div 
        className="flex-1 cursor-pointer"
        onClick={() => handleClick(id)}
      >
        <h3 className="font-medium text-base text-gray-800 dark:text-white mb-1">{title}</h3>
      </div>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onAddToPlaylist(id);
        }}
        className="ml-2 p-1 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
      </button>
    </div>
  );
};

export default Tile;
