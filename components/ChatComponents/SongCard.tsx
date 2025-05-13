'use client';

import React, { useEffect, useState } from 'react';

type SpotifyEmbedProps = {
  spotifyId?: string;
  title: string;
  artist: string;
};

const SongCard = ({
  spotifyId: initialId,
  title,
  artist,
}: SpotifyEmbedProps) => {
  const [spotifyId, setSpotifyId] = useState<string | undefined>(initialId);
  const [loading, setLoading] = useState(!initialId);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSpotifyId = async () => {
      // Only fetch if we don't have an ID but have enough info to search
      if (!initialId) {
        try {
          setLoading(true);
          setError(null);

          console.log('Frontend sending:', { title, artist });

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
          console.log(response);

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
  }, [initialId, title, artist]);

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
