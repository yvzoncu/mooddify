import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import {
  Music,
  X,
  Plus,
  Trash2,
  Activity,
  Music2,
  Heart,
  Volume2,
} from 'lucide-react';

interface PlaylistItem {
  id: number;
  song: string;
  artist: string;
  genre: string;
  tempo: number;
  danceability: number;
  energy: number;
  valence: number;
  acousticness: number;
  release_year: number | null;
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

interface GlobalPlaylistViewProps {
  onClose: () => void;
  onSelectPlaylist: (playlistId: number) => void;
  onCreateNewPlaylist?: () => void;
  onDeletePlaylist?: (playlistId: number) => void;
}

const GlobalPlaylistView = ({
  onClose,
  onSelectPlaylist,
  onCreateNewPlaylist,
  onDeletePlaylist,
}: GlobalPlaylistViewProps) => {
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const userId = user?.id || '';

  useEffect(() => {
    const fetchPlaylists = async () => {
      if (!userId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await fetch(
          `http://56.228.4.188/api/get-user-playlist?user_id=${userId}`
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

    fetchPlaylists();
  }, [userId]);

  const renderMetrics = (items: PlaylistItem[]) => {
    if (!items || items.length === 0) return null;

    const averages = items.reduce(
      (acc, item) => ({
        energy: acc.energy + item.energy,
        acousticness: acc.acousticness + item.acousticness,
        valence: acc.valence + item.valence,
        danceability: acc.danceability + item.danceability,
      }),
      { energy: 0, acousticness: 0, valence: 0, danceability: 0 }
    );

    const count = items.length;

    return (
      <div className="flex gap-3 mt-2">
        <div className="flex items-center gap-1" title="Energy">
          <Activity size={14} className="text-yellow-400" />
          <span className="text-xs text-gray-400">
            {Math.round((averages.energy / count) * 100)}%
          </span>
        </div>
        <div className="flex items-center gap-1" title="Acousticness">
          <Music2 size={14} className="text-blue-400" />
          <span className="text-xs text-gray-400">
            {Math.round((averages.acousticness / count) * 100)}%
          </span>
        </div>
        <div className="flex items-center gap-1" title="Mood">
          <Heart size={14} className="text-red-400" />
          <span className="text-xs text-gray-400">
            {Math.round((averages.valence / count) * 100)}%
          </span>
        </div>
        <div className="flex items-center gap-1" title="Danceability">
          <Volume2 size={14} className="text-green-400" />
          <span className="text-xs text-gray-400">
            {Math.round((averages.danceability / count) * 100)}%
          </span>
        </div>
      </div>
    );
  };

  if (!userId) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
        <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4 text-white">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Sign In Required</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <X size={24} />
            </button>
          </div>
          <p className="text-gray-300 text-center mb-4">
            Please sign in to view your playlists
          </p>
          <button
            onClick={onClose}
            className="w-full py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4 text-white">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-gray-700 rounded-lg">
              <Music className="w-5 h-5 text-purple-400" />
            </div>
            <h2 className="text-xl font-bold">My Playlists</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {loading ? (
          <div className="text-center py-8">
            <div className="text-gray-400">Loading playlists...</div>
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <div className="text-red-400">Error: {error}</div>
          </div>
        ) : (
          <div className="space-y-3 max-h-96 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800">
            {playlists.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-400 mb-4">No playlists found</p>
                {onCreateNewPlaylist && (
                  <button
                    onClick={onCreateNewPlaylist}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-500 transition-colors"
                  >
                    <Plus size={20} />
                    <span>Create New Playlist</span>
                  </button>
                )}
              </div>
            ) : (
              playlists.map((playlist) => (
                <div
                  key={playlist.id}
                  className="group flex flex-col p-4 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div
                      className="flex-1 cursor-pointer"
                      onClick={() => {
                        onSelectPlaylist(playlist.id);
                        onClose();
                      }}
                    >
                      <div className="font-medium">
                        {playlist.playlist_name}
                      </div>
                      <div className="text-sm text-gray-400">
                        {playlist.playlist_items.length} songs
                      </div>
                      {renderMetrics(playlist.playlist_items)}
                    </div>
                    {onDeletePlaylist && (
                      <button
                        onClick={() => onDeletePlaylist(playlist.id)}
                        className="p-2 text-gray-400 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"
                        title="Delete playlist"
                      >
                        <Trash2 size={20} />
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {playlists.length > 0 && onCreateNewPlaylist && (
          <div className="mt-4 pt-4 border-t border-gray-700">
            <button
              onClick={onCreateNewPlaylist}
              className="w-full flex items-center justify-center gap-2 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-500 transition-colors"
            >
              <Plus size={20} />
              <span>Create New Playlist</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default GlobalPlaylistView;
