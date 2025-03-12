import React, { useState } from 'react';

interface PlaylistDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onAddToPlaylist: (playlistName: string) => void;
}

const PlaylistDialog: React.FC<PlaylistDialogProps> = ({ isOpen, onClose, onAddToPlaylist }) => {
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [playlists, setPlaylists] = useState<string[]>(() => {
    // Load playlists from localStorage
    const saved = localStorage.getItem('playlists');
    return saved ? JSON.parse(saved) : ['Default Playlist'];
  });

  const handleCreatePlaylist = () => {
    if (newPlaylistName.trim()) {
      const updatedPlaylists = [...playlists, newPlaylistName];
      setPlaylists(updatedPlaylists);
      localStorage.setItem('playlists', JSON.stringify(updatedPlaylists));
      onAddToPlaylist(newPlaylistName);
      setNewPlaylistName('');
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="fixed inset-0 bg-black opacity-50" onClick={onClose}></div>
        <div className="relative bg-white dark:bg-gray-800 rounded-lg w-full max-w-md p-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Add to Playlist</h3>
          
          {/* Existing Playlists */}
          <div className="mb-4 space-y-2">
            {playlists.map((playlist) => (
              <button
                key={playlist}
                onClick={() => {
                  onAddToPlaylist(playlist);
                  onClose();
                }}
                className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-gray-700 dark:text-gray-300"
              >
                {playlist}
              </button>
            ))}
          </div>

          {/* Create New Playlist */}
          <div className="border-t dark:border-gray-700 pt-4">
            <h4 className="text-sm font-medium mb-2 text-gray-900 dark:text-white">Create New Playlist</h4>
            <div className="flex gap-2">
              <input
                type="text"
                value={newPlaylistName}
                onChange={(e) => setNewPlaylistName(e.target.value)}
                placeholder="Enter playlist name"
                className="flex-1 px-3 py-2 border dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
              <button
                onClick={handleCreatePlaylist}
                disabled={!newPlaylistName.trim()}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
              >
                Create
              </button>
            </div>
          </div>

          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-2 right-2 text-gray-400 hover:text-gray-500"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default PlaylistDialog;
