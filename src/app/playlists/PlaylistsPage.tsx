"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface PlaylistVideo {
  id: string;
  title: string;
}

interface Playlist {
  name: string;
  videos: PlaylistVideo[];
}

interface PlaylistsData {
  [key: string]: PlaylistVideo[];
}

const PlaylistsPage = () => {
  const [playlists, setPlaylists] = useState<PlaylistsData>({});
  const [expandedPlaylist, setExpandedPlaylist] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const playlistsData = localStorage.getItem('playlistsData');
    if (playlistsData) {
      setPlaylists(JSON.parse(playlistsData));
    }
  }, []);

  const handleVideoClick = (videoId: string) => {
    router.push(`/?video=${videoId}`);
  };

  const togglePlaylist = (playlistName: string) => {
    setExpandedPlaylist(expandedPlaylist === playlistName ? null : playlistName);
  };

  const handleRemovePlaylist = (playlistName: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering the toggle
    
    // Remove from playlistsData
    const updatedPlaylists = { ...playlists };
    delete updatedPlaylists[playlistName];
    setPlaylists(updatedPlaylists);
    localStorage.setItem('playlistsData', JSON.stringify(updatedPlaylists));

    // Remove from playlists metadata storage
    const savedPlaylists = JSON.parse(localStorage.getItem('playlists') || '[]');
    const filteredPlaylists = savedPlaylists.filter((p: any) => p.name !== playlistName);
    localStorage.setItem('playlists', JSON.stringify(filteredPlaylists));
  };

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">Your Playlists</h1>
        <div className="space-y-6">
          {Object.entries(playlists).map(([playlistName, videos]) => (
            <div key={playlistName} className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
              <h2 
                onClick={() => togglePlaylist(playlistName)}
                className="text-xl font-semibold mb-4 text-gray-800 dark:text-white cursor-pointer flex justify-between items-center"
              >
                <span>{playlistName}</span>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={(e) => handleRemovePlaylist(playlistName, e)}
                    className="text-red-500 hover:text-red-700 px-2"
                    title="Remove playlist"
                  >
                    −
                  </button>
                  <span className="text-sm">{expandedPlaylist === playlistName ? '▼' : '▶'}</span>
                </div>
              </h2>
              {expandedPlaylist === playlistName && (
                <div className="space-y-2">
                  {videos.map((video) => (
                    <div
                      key={video.id}
                      onClick={() => handleVideoClick(video.id)}
                      className="flex items-center p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded cursor-pointer"
                    >
                      <span className="text-gray-800 dark:text-white">{video.title}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
        {Object.keys(playlists).length === 0 && (
          <div className="text-center text-gray-500 dark:text-gray-400 mt-8">
            No playlists found. Add videos to playlists from the video player.
          </div>
        )}
      </div>
    </div>
  );
};

export default PlaylistsPage;
