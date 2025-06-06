'use client';

import React, { useEffect, useState } from 'react';

type SongProps = {
  id: string | number;
  song: string;
  artist: string;
  spotify_id?: string;
  album_image?: string;
};

const SongCard = ({ id, song, artist, spotify_id }: SongProps) => {
  const [spotifyId, setSpotifyId] = useState<string | undefined>(spotify_id);
  const [albumImage, setAlbumImage] = useState<string | undefined>();
  const [loading, setLoading] = useState(!spotify_id);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // If both spotify_id and album_image are missing, fetch from external API
    if (!spotify_id && !albumImage && id) {
      const fetchSpotifyInfo = async () => {
        try {
          setLoading(true);
          setError(null);
          const response = await fetch(
            `http://56.228.4.188/api/update-song-spotify-info?id=${id}`,
            {
              method: 'PATCH',
            }
          );
          if (!response.ok) throw new Error('Failed to fetch Spotify info');
          const data = await response.json();
          if (data.spotify_id) setSpotifyId(data.spotify_id);
          if (data.album_image) setAlbumImage(data.album_image);
        } catch {
          setError('Failed to load Spotify info');
        } finally {
          setLoading(false);
        }
      };
      fetchSpotifyInfo();
      return;
    }
    // If spotify_id is still not available, fallback to search
    if (!spotify_id && !spotifyId) {
      const fetchSpotifyId = async () => {
        try {
          setLoading(true);
          setError(null);
          const response = await fetch('/api/spotify/search', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              title: song,
              artist,
            }),
          });
          if (!response.ok) throw new Error('Failed to search for track');
          const data = await response.json();
          if (data.trackId) setSpotifyId(data.trackId);
          // No album image from this endpoint
        } catch {
          setError('Failed to load track information');
        } finally {
          setLoading(false);
        }
      };
      fetchSpotifyId();
    }
  }, [spotifyId, song, artist, spotify_id, id, albumImage]);

  if (loading) {
    return (
      <div className="w-full max-w-xl mx-auto text-gray-400 italic text-sm text-center py-4">
        Loading song preview...
      </div>
    );
  }

  if (error || !spotifyId) {
    return (
      <div className="w-full max-w-xl mx-auto text-red-400 italic text-sm text-center py-4">
        {error || 'Track information unavailable'}
      </div>
    );
  }

  return (
    <div className="w-full max-w-xl mx-auto">
      <iframe
        src={`https://open.spotify.com/embed/track/${spotifyId}?utm_source=generator&theme=0`}
        width="100%"
        height="80"
        frameBorder="0"
        allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
        allowFullScreen
        title={`Spotify: ${song}`}
        loading="lazy"
        className="rounded-lg"
      />
    </div>
  );
};

export default SongCard;
