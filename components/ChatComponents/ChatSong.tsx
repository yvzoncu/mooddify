import { Search, Bookmark, Plus } from 'lucide-react';
import { useState, useEffect } from 'react';
import React from 'react';
import SongCard from '@/components/ChatComponents/SongCard';
import { SongItem } from '@/types/MoodifyTypes';
import { useAuth } from '@/contexts/AuthContext';

interface ChatSongProps {
  song: SongItem;
  onNewPlaylist: (song: SongItem) => void;
  onSelectPlaylist: (playlistId: number, song_id: number) => void;
  findSimilar?: () => void;
}

interface PlaylistItem {
  song_id: number | string;
}

interface Playlist {
  id: number;
  user_id: string;
  playlist_name: string;
  playlist_items: PlaylistItem[];
}

interface PlaylistsResponse {
  playlists: Playlist[];
}

// Playlists Component
const PlaylistsComponent = ({
  onClose,
  position,
  userId,
  song,
  onNewPlaylist,
  onSelectPlaylist,
}: {
  onClose: () => void;
  position: { top: number; left: number };
  userId: string;
  song: SongItem;
  onNewPlaylist: (song: SongItem) => void;
  onSelectPlaylist: (playlistId: number, song_id: number) => void;
}) => {
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPlaylists = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `http://13.48.124.211/api/get-user-playlist?user_id=${userId}`
        );

        if (!response.ok) {
          throw new Error('Failed to fetch playlists');
        }

        const data: PlaylistsResponse = await response.json();
        setPlaylists(data.playlists || []);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Failed to load playlists'
        );
        console.error('Error fetching playlists:', err);
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchPlaylists();
    }
  }, [userId]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg shadow-xl p-6 w-80 max-h-96 overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
        style={{
          position: 'absolute',
          top: position.top,
          left: position.left,
          transform: 'translate(-50%, -100%)',
        }}
      >
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="text-gray-500">Loading playlists...</div>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center py-8">
            <div className="text-red-500">Error: {error}</div>
          </div>
        ) : (
          <div className="space-y-3">
            {playlists.map((playlist) => (
              <div
                key={playlist.id}
                className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg cursor-pointer group"
                onClick={() => {
                  onSelectPlaylist(playlist.id, song.song_id);
                  onClose();
                }}
              >
                <div className="flex items-center space-x-3">
                  <div className="w-5 h-5 border-2 rounded flex items-center justify-center border-gray-300 group-hover:border-gray-400">
                    {/* You can add completion logic here if needed */}
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">
                      {playlist.playlist_name}
                    </div>
                    <div className="text-sm text-gray-500">
                      {playlist.playlist_items.length} items
                    </div>
                  </div>
                </div>
              </div>
            ))}

            <div
              className="flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-lg cursor-pointer text-green-600 font-medium"
              onClick={() => {
                onNewPlaylist(song);
                onClose();
              }}
            >
              <Plus size={20} />
              <span>New playlist</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const ChatSong: React.FC<ChatSongProps> = ({
  song,
  onNewPlaylist,
  onSelectPlaylist,
}) => {
  const [showPlaylists, setShowPlaylists] = useState(false);
  const [playlistPosition, setPlaylistPosition] = useState({ top: 0, left: 0 });
  const { user } = useAuth();
  const userId = user?.id || '';

  const handleBookmarkClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (!user?.id) {
      alert('Please sign in to add songs to playlists');
      return;
    }
    const buttonRect = event.currentTarget.getBoundingClientRect();
    setPlaylistPosition({
      top: buttonRect.top,
      left: buttonRect.left + buttonRect.width / 2,
    });
    setShowPlaylists(true);
  };

  const closePlaylists = () => {
    setShowPlaylists(false);
  };

  return (
    <>
      <div className="relative w-full max-w-xl p-4 pb-16 bg-gray-800 rounded-lg shadow-md">
        {/* Tags at the top, under title */}
        <div className="flex flex-wrap gap-2 mb-3">
          {(song.tags ?? []).map((chip: string, index: number) => (
            <span
              key={index}
              className="px-2 py-1 text-xs bg-gray-200 text-gray-800 rounded-full"
            >
              {chip}
            </span>
          ))}
        </div>
        <SongCard title={song.song} artist={song.artist} />

        {/* Buttons absolutely positioned at bottom right */}
        <div className="absolute bottom-2 right-2 flex gap-2">
          <button
            onClick={() => {}}
            title="Find Similar"
            className="p-2 rounded-full hover:bg-gray-200 hover:text-black text-white transition-colors"
          >
            <Search size={20} />
          </button>
          <button
            onClick={handleBookmarkClick}
            title="Add to Playlist"
            className="p-2 rounded-full hover:bg-gray-200 transition-colors text-white hover:text-black"
          >
            <Bookmark size={20} />
          </button>
        </div>
      </div>

      {/* Playlists Modal */}
      {showPlaylists && (
        <PlaylistsComponent
          onClose={closePlaylists}
          position={playlistPosition}
          userId={userId}
          song={song}
          onNewPlaylist={onNewPlaylist}
          onSelectPlaylist={onSelectPlaylist}
        />
      )}
    </>
  );
};

export default ChatSong;
