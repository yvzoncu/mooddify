'use client';

import React, { useEffect, useState } from 'react';

type SongProps = {
  title: string;
  artist: string;
};

const SongCard = ({ title, artist }: SongProps) => {
  const [spotifyId, setSpotifyId] = useState<string | undefined>();
  const [loading, setLoading] = useState(!spotifyId);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSpotifyId = async () => {
      if (!spotifyId) {
        try {
          setLoading(true);
          setError(null);

          // Call your backend API instead of directly accessing Spotify
          const response = await fetch('/api/spotify/search', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              title,
              artist,
            }),
          });

          if (!response.ok) {
            throw new Error('Failed to search for track');
          }

          const data = await response.json();
          if (data.trackId) {
            setSpotifyId(data.trackId);
          } else {
            setError(`Could not find "${title}" by "${artist}" on Spotify`);
          }
        } catch (err) {
          console.error('Error searching for track:', err);
          setError('Failed to load track information');
        } finally {
          setLoading(false);
        }
      }
    };

    fetchSpotifyId();
  }, [spotifyId, title, artist]);

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
        title={`Spotify: ${title}`}
        loading="lazy"
        className="rounded-lg"
      />
    </div>
  );
};

export default SongCard;
