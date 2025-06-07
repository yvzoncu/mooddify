'use client';
import React, { useEffect, useState } from 'react';
import Image from 'next/image';

interface PlaylistItem {
  song_id: number;
  song: string;
  artist: string;
  album_image?: string;
}

interface SharedPlaylistApiResponse {
  playlist: {
    playlist_name?: string;
    user_name?: string;
    user_id?: string;
  };
  items: PlaylistItem[];
}

export default function SharedPlaylistClient({
  share_token,
}: {
  share_token: string;
}) {
  const [loading, setLoading] = useState(true);
  const [playlistData, setPlaylistData] =
    useState<SharedPlaylistApiResponse | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchSharedPlaylist() {
      setLoading(true);
      setError('');
      try {
        const res = await fetch(
          `http://56.228.4.188/api/get-shared-playlist?share_token=${share_token}`,
          { headers: { accept: 'application/json' } }
        );
        if (!res.ok) throw new Error('Failed to fetch shared playlist');
        const data = await res.json();
        setPlaylistData(data);
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : String(e));
      } finally {
        setLoading(false);
      }
    }
    fetchSharedPlaylist();
  }, [share_token]);

  if (loading) {
    return (
      <div className="max-w-xl mx-auto mt-10 p-6 bg-black text-white rounded-lg shadow text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500 mx-auto mb-4"></div>
        <p>Loading shared playlist...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-xl mx-auto mt-10 p-6 bg-black text-white rounded-lg shadow">
        <h2 className="text-xl font-bold mb-4">Error</h2>
        <p>{error}</p>
      </div>
    );
  }

  if (!playlistData || !playlistData.playlist) {
    return (
      <div className="max-w-xl mx-auto mt-10 p-6 bg-black text-white rounded-lg shadow">
        <h2 className="text-xl font-bold mb-4">No Playlist Found</h2>
        <p>This shared playlist could not be found.</p>
      </div>
    );
  }

  const { playlist, items } = playlistData;

  return (
    <div className="bg-gray-800 min-h-screen w-full">
      <div className="max-w-xl mx-auto mt-10 p-6 bg-black text-white rounded-lg shadow">
        <h2 className="text-2xl font-bold mb-2">
          {playlist.playlist_name || 'Shared Playlist'}
        </h2>
        <p className="mb-4 text-gray-400">
          Shared by: {playlist.user_name || playlist.user_id || 'Unknown'}
        </p>
        <div className="mb-6">
          {items.length === 0 ? (
            <p>No songs in this playlist.</p>
          ) : (
            <ul className="space-y-2">
              {items.map((item) => (
                <li
                  key={item.song_id}
                  className="flex items-center gap-3 p-2 bg-gray-800 rounded"
                >
                  {item.album_image && (
                    <Image
                      src={item.album_image}
                      alt={item.song}
                      width={48}
                      height={48}
                      className="w-12 h-12 rounded object-cover"
                    />
                  )}
                  <div>
                    <div className="font-semibold">{item.song}</div>
                    <div className="text-gray-400 text-sm">{item.artist}</div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
        <button
          className="w-full py-2 bg-purple-600 hover:bg-purple-700 rounded text-white font-semibold transition-colors"
          onClick={() =>
            alert('Add to My Playlists functionality coming soon!')
          }
        >
          Add to My Playlists
        </button>
      </div>
    </div>
  );
}
