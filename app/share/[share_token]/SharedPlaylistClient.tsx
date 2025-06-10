'use client';
import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { setTempPlaylist } from '@/utils/tempPlaylist';
import { SongItem } from '@/types/MoodifyTypes';

interface PlaylistItem {
  song_id: number;
  song: string;
  artist: string;
  album_image?: string | null;
  song_info?: string;
  tempo?: number;
  danceability?: number;
  energy?: number;
  acousticness?: number;
  valence?: number;
  release_year?: number | null;
  genre?: string;
  spotify_id?: string | null;
}

interface SharedPlaylistApiResponse {
  playlist: {
    id?: number;
    playlist_name?: string;
    user_name?: string;
    user_id?: string;
    owner_notes?: string;
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
  const [accepting, setAccepting] = useState(false);
  const router = useRouter();
  const { user } = useAuth();

  const handleAcceptPlaylist = async () => {
    if (!playlistData || !playlistData.items.length) return;

    setAccepting(true);

    try {
      if (!user) {
        // User not logged in - add to temp playlist
        const tempPlaylistItems: SongItem[] = playlistData.items.map(
          (item) => ({
            song_id: item.song_id,
            song: item.song,
            artist: item.artist,
            genre: item.genre || 'Unknown',
            tempo: item.tempo || 0,
            danceability: item.danceability || 0,
            energy: item.energy || 0,
            acousticness: item.acousticness || 0,
            valence: item.valence || 0,
            song_info: item.song_info || '',
            dominants: [],
            tags: [],
            spotify_id: item.spotify_id || undefined,
            album_image: item.album_image || undefined,
          })
        );

        setTempPlaylist(tempPlaylistItems);
        alert(
          `Added ${tempPlaylistItems.length} songs to your temporary playlist!`
        );
        router.push('/?showTempPlaylist=true');
      } else {
        // User logged in - create new playlist
        const playlistName = `Shared: ${
          playlistData.playlist.playlist_name || 'Untitled'
        }`;
        const playlistItems = playlistData.items.map((item) => ({
          song_id: item.song_id,
        }));

        const response = await fetch(
          'http://56.228.4.188/api/create-user-playlist',
          {
            method: 'POST',
            headers: {
              accept: 'application/json',
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              user_id: user.id,
              playlist_name: playlistName,
              playlist_items: playlistItems,
            }),
          }
        );

        if (!response.ok) {
          throw new Error('Failed to create playlist');
        }

        const result = await response.json();
        console.log('Create playlist API response:', result); // Debug log

        if (
          !result.new_item ||
          !result.new_item.playlist ||
          !result.new_item.playlist.id
        ) {
          throw new Error('Invalid API response structure');
        }

        alert(
          `Created playlist "${playlistName}" with ${playlistItems.length} songs!`
        );
        // Navigate with the new playlist ID to auto-display it
        router.push(`/?showPlaylist=${result.new_item.playlist.id}`);
      }
    } catch (error) {
      console.error('Error accepting playlist:', error);
      alert('Failed to accept playlist. Please try again.');
    } finally {
      setAccepting(false);
    }
  };

  useEffect(() => {
    async function fetchSharedPlaylist() {
      setLoading(true);
      setError('');
      try {
        const res = await fetch(
          `http://56.228.4.188/api/get-shared-playlist?share_token=${share_token}`,
          { headers: { accept: 'application/json' } }
        );
        if (!res.ok) {
          const errorText = await res.text();
          throw new Error(
            `Failed to fetch shared playlist: ${res.status} ${errorText}`
          );
        }
        const data = await res.json();
        console.log('API Response:', data); // Debug log
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
        <p className="mb-2 text-gray-400">
          Shared by: {playlist.user_name || playlist.user_id || 'Unknown'}
        </p>
        <p className="mb-2 text-gray-500 text-sm">
          {items.length} song{items.length !== 1 ? 's' : ''}
        </p>
        {playlist.owner_notes && (
          <p className="mb-4 text-gray-300 italic border-l-4 border-purple-600 pl-3">
            &ldquo;{playlist.owner_notes}&rdquo;
          </p>
        )}
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
                  {item.album_image ? (
                    <Image
                      src={item.album_image}
                      alt={item.song}
                      width={48}
                      height={48}
                      className="w-12 h-12 rounded object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded bg-gray-600 flex items-center justify-center">
                      <span className="text-gray-400 text-xs">♪</span>
                    </div>
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
          className="w-full py-2 bg-purple-600 hover:bg-purple-700 rounded text-white font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={handleAcceptPlaylist}
          disabled={accepting}
        >
          {accepting ? 'Adding to Playlist...' : 'Accept Shared Playlist'}
        </button>
      </div>
    </div>
  );
}
