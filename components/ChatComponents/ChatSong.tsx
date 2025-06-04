import {
  Search,
  Bookmark,
  Plus,
  Activity,
  Music2,
  Heart,
  Volume2,
} from 'lucide-react';
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
        setError(null);
        console.log('Fetching playlists for user:', userId);

        const response = await fetch(
          `http://56.228.4.188/api/get-user-playlist?user_id=${userId}`,
          {
            method: 'GET',
            headers: {
              Accept: 'application/json',
            },
          }
        );

        console.log('Playlist response status:', response.status);

        if (!response.ok) {
          const errorText = await response.text();
          console.error('Playlist fetch error:', {
            status: response.status,
            statusText: response.statusText,
            body: errorText,
          });
          throw new Error(`Failed to fetch playlists: ${response.statusText}`);
        }

        const data: PlaylistsResponse = await response.json();
        console.log('Playlists fetched:', {
          count: data.playlists?.length || 0,
        });

        setPlaylists(data.playlists || []);
      } catch (err) {
        console.error('Error fetching playlists:', err);
        setError(
          err instanceof Error ? err.message : 'Failed to load playlists'
        );
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchPlaylists();
    } else {
      setError('No user ID provided');
      setLoading(false);
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
        {/* Song Info */}
        <div className="mb-4 text-sm text-gray-300">
          <p>{song.song_info}</p>
        </div>

        <SongCard title={song.song} artist={song.artist} />

        {/* Musical Features and Buttons */}
        <div className="absolute bottom-2 left-2 right-2 flex justify-between items-center">
          {/* Musical Features */}
          <div className="flex gap-4 text-xs text-gray-300">
            <div
              className="flex items-center gap-1 group relative cursor-help"
              aria-label="Energy"
            >
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
                Energy Level
              </div>
              <Activity size={16} className="text-yellow-400" />
              <span>{Math.round(song.energy * 100)}%</span>
            </div>
            <div
              className="flex items-center gap-1 group relative cursor-help"
              aria-label="Acousticness"
            >
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
                Acoustic Elements
              </div>
              <Music2 size={16} className="text-blue-400" />
              <span>{Math.round(song.acousticness * 100)}%</span>
            </div>
            <div
              className="flex items-center gap-1 group relative cursor-help"
              aria-label="Valence"
            >
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
                Musical Positivity
              </div>
              <Heart size={16} className="text-red-400" />
              <span>{Math.round(song.valence * 100)}%</span>
            </div>
            <div
              className="flex items-center gap-1 group relative cursor-help"
              aria-label="Danceability"
            >
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
                Dance Rhythm
              </div>
              <Volume2 size={16} className="text-green-400" />
              <span>{Math.round(song.danceability * 100)}%</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
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
