import { useState, useEffect } from 'react';

interface Playlist {
  id: string;
  name: string;
  videos: string[];
}

interface PlaylistModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (playlistId: string) => void;
}

export default function PlaylistModal({ isOpen, onClose, onSave }: PlaylistModalProps) {
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [newPlaylistName, setNewPlaylistName] = useState('');

  useEffect(() => {
    const saved = localStorage.getItem('playlists');
    if (saved) {
      const loadedPlaylists = JSON.parse(saved);
      // Ensure each playlist has a videos array
      const validPlaylists = loadedPlaylists.map((playlist: Playlist) => ({
        ...playlist,
        videos: Array.isArray(playlist.videos) ? playlist.videos : []
      }));
      setPlaylists(validPlaylists);
    }
  }, []);

  const createNewPlaylist = () => {
    if (!newPlaylistName.trim()) return;
    
    const newPlaylist: Playlist = {
      id: Date.now().toString(),
      name: newPlaylistName,
      videos: []
    };
    
    const updatedPlaylists = [...playlists, newPlaylist];
    setPlaylists(updatedPlaylists);
    localStorage.setItem('playlists', JSON.stringify(updatedPlaylists));
    setNewPlaylistName('');
    onSave(newPlaylist.id);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      createNewPlaylist();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg w-96">
        <h3 className="text-lg font-bold mb-4 dark:text-white">Select Playlist</h3>
        
        <div className="space-y-2 mb-4">
          {playlists.map(playlist => (
            <button
              key={playlist.id}
              onClick={() => onSave(playlist.id)}
              className="w-full text-left p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
            >
              {playlist.name}
            </button>
          ))}
        </div>

        <div className="flex gap-2">
          <input
            type="text"
            value={newPlaylistName}
            onChange={(e) => setNewPlaylistName(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="New playlist name"
            className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
            autoFocus
          />
        </div>

        <button
          onClick={onClose}
          className="mt-4 w-full p-2 border rounded hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
