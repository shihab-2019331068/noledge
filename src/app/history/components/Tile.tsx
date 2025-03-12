import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import PlaylistDialog from '../../../components/PlaylistDialog';

interface TileProps {
  id: string;
  title: string;
  onVideoClick: (id: string) => void;
  onAddToPlaylist: (id: string) => void;
}

const Tile: React.FC<TileProps> = ({ id, title, onVideoClick, onAddToPlaylist }) => {
  const router = useRouter();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleClick = (id: string) => {
    router.push(`/?video=${id}`);
  };

  const handleAddToPlaylist = (playlistName: string) => {
    // Get existing playlist data
    const playlistsData = JSON.parse(localStorage.getItem('playlistsData') || '{}');
    
    // Add video to playlist
    if (!playlistsData[playlistName]) {
      playlistsData[playlistName] = [];
    }
    
    if (!playlistsData[playlistName].some((video: any) => video.id === id)) {
      playlistsData[playlistName].push({ id, title });
    }
    
    // Save updated playlists
    localStorage.setItem('playlistsData', JSON.stringify(playlistsData));
    onAddToPlaylist(id);
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
          setIsDialogOpen(true);
        }}
        className="ml-2 p-1 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
      </button>

      <PlaylistDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onAddToPlaylist={handleAddToPlaylist}
      />
    </div>
  );
};

export default Tile;
