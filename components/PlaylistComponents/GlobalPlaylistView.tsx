import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';

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

interface GlobalPlaylistViewProps {
  onClose: () => void;
  onSelectPlaylist: (playlistId: number) => void;
}

const GlobalPlaylistView = ({
  onClose,
  onSelectPlaylist,
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

    fetchPlaylists();
  }, [userId]);

  if (!userId) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center ">
        <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
          <p className="text-gray-900 text-center">
            Please sign in to view your playlists
          </p>
          <button
            onClick={onClose}
            className="mt-4 w-full py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center ">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-900">My Playlists</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>

        {loading ? (
          <div className="text-center py-8">
            <div className="text-gray-500">Loading playlists...</div>
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <div className="text-red-500">Error: {error}</div>
          </div>
        ) : (
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {playlists.length === 0 ? (
              <p className="text-gray-500 text-center py-4">
                No playlists found
              </p>
            ) : (
              playlists.map((playlist) => (
                <div
                  key={playlist.id}
                  className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg cursor-pointer"
                  onClick={() => {
                    onSelectPlaylist(playlist.id);
                    onClose();
                  }}
                >
                  <div>
                    <div className="font-medium text-gray-900">
                      {playlist.playlist_name}
                    </div>
                    <div className="text-sm text-gray-500">
                      {playlist.playlist_items.length} items
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default GlobalPlaylistView;
