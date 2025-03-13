'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { PlusIcon } from '@heroicons/react/24/outline'
import PlaylistModal from '../components/PlaylistModal'

interface RecentVideo {
  id: string;
  title: string;
  timestamp: number;
}

interface PlaylistVideo {
  id: string;
  title: string;
}

const HistoryPage = () =>  {
  const router = useRouter()
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [recentVideos, setRecentVideos] = useState<RecentVideo[]>([]);
  const [isPlaylistModalOpen, setIsPlaylistModalOpen] = useState(false);
  const [selectedVideoId, setSelectedVideoId] = useState<string | null>(null);

  useEffect(() => {
    // Load recent videos from localStorage
    const saved = localStorage.getItem('recentYoutubeVideos');
    if (saved) {
      setRecentVideos(JSON.parse(saved));
    }
  }, []);

  const handleAddToPlaylist = (id: string) => {
    setSelectedVideoId(id);
    setIsPlaylistModalOpen(true);
  };

  const handlePlaylistSave = (playlistId: string) => {
    if (!selectedVideoId) return;

    // Get the video title from recentVideos
    const video = recentVideos.find(v => v.id === selectedVideoId);
    if (!video) return;

    // Get existing playlists data
    const playlistsData = JSON.parse(localStorage.getItem('playlistsData') || '{}');
    
    // Find the playlist name from the playlists in localStorage
    const playlists = JSON.parse(localStorage.getItem('playlists') || '[]');
    const playlist = playlists.find((p: any) => p.id === playlistId);
    if (!playlist) return;

    // If playlist doesn't exist, create it
    if (!playlistsData[playlist.name]) {
      playlistsData[playlist.name] = [];
    }

    // Add video if it's not already in the playlist
    const isVideoInPlaylist = playlistsData[playlist.name].some((v: PlaylistVideo) => v.id === selectedVideoId);
    if (!isVideoInPlaylist) {
      playlistsData[playlist.name].push({
        id: selectedVideoId,
        title: video.title
      });
    }

    localStorage.setItem('playlistsData', JSON.stringify(playlistsData));
    setIsPlaylistModalOpen(false);
    setSelectedVideoId(null);
  };

  const handleVideoClick = (id: string) => {
    router.push(`/?video=${id}`);
  };

  return (
    <div className={`min-h-screen flex flex-col`}>
      <div className="flex flex-1">
        <main className={`flex-1 transition-all duration-300 ${isSidebarOpen ? 'ml-48' : 'ml-16'}`}>
          <div className="p-2 w-full">
            <h2 className="text-2xl font-bold mb-2 text-gray-800 dark:text-white">Recent Videos</h2>
            <div className="space-y-2">
              {recentVideos.map((video) => (
                <div
                  key={video.id}
                  className="flex items-center justify-between p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded group"
                >
                  <div
                    onClick={() => handleVideoClick(video.id)}
                    className="flex-grow cursor-pointer"
                  >
                    <span className="text-gray-800 dark:text-white">{video.title}</span>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAddToPlaylist(video.id);
                    }}
                    className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600"
                    title="Add to playlist"
                  >
                    <PlusIcon className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
      <PlaylistModal
        isOpen={isPlaylistModalOpen}
        onClose={() => setIsPlaylistModalOpen(false)}
        onSave={handlePlaylistSave}
      />
    </div>
  );
};

export default HistoryPage;