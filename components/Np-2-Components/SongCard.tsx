import { useState } from 'react';
import { motion } from 'framer-motion';
import { FaSpotify, FaYoutube } from 'react-icons/fa';
import { Music2 } from 'lucide-react';
import { Song } from '@/types/emotion-types';
import SongTags from '@/components/Np-2-Components/SongTags';
import axios from 'axios';
import { Loader2 } from 'lucide-react';

const API_CONFIG = {
  SPOTIFY_CLIENT_ID: '8bf6cef1e2a24f9883431685c9861335',
  SPOTIFY_CLIENT_SECRET: '922fa04dd1274dbda39117e6aee66b70',
};

// Get Spotify Access Token
const getSpotifyToken = async (): Promise<string> => {
  try {
    const resp = await axios.post(
      'https://accounts.spotify.com/api/token',
      new URLSearchParams({ grant_type: 'client_credentials' }),
      {
        headers: {
          Authorization: `Basic ${btoa(
            `${API_CONFIG.SPOTIFY_CLIENT_ID}:${API_CONFIG.SPOTIFY_CLIENT_SECRET}`
          )}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );
    return resp.data.access_token;
  } catch (err) {
    console.error('Failed to get Spotify token:', err);
    return '';
  }
};

// Fetch Spotify track ID
const fetchSpotifyId = async (
  songName: string,
  artist: string,
  token: string
): Promise<string | null> => {
  const query = `track:${songName} artist:${artist}`;
  const url = `https://api.spotify.com/v1/search?q=${encodeURIComponent(
    query
  )}&type=track&limit=1`;

  try {
    const resp = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    const track = resp.data.tracks.items[0];
    return track ? track.id : null;
  } catch (err) {
    console.error(
      `Failed to fetch Spotify ID for ${songName} by ${artist}:`,
      err
    );
    return null;
  }
};

export default function SongCard({
  song: title,
  artist,
  description,
  tags,
  selected = false,
  onSelect,
}: Song & { onSelect?: (val: boolean) => void }) {
  const [loading, setLoading] = useState(false);
  const [spotifyId, setSpotifyId] = useState<string | null>(null);

  const handleSpotifyClick = async (e: React.MouseEvent) => {
    setLoading(true);
    e.preventDefault();
    e.stopPropagation();

    const token = await getSpotifyToken();
    const id = await fetchSpotifyId(title, artist, token);
    if (id) {
      setSpotifyId(id);
    }
    setLoading(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3 }}
    >
      <div
        onClick={() => onSelect?.(!selected)}
        className={`cursor-pointer border rounded-lg p-4 bg-white shadow-sm transform transition-all duration-300 hover:scale-105 ${
          selected
            ? 'border-indigo-500 ring-2 ring-indigo-200'
            : 'border-gray-200'
        }`}
      >
        <div className="flex items-start gap-3 mb-2">
          <div className="w-10 h-10 flex items-center justify-center rounded-full bg-indigo-100 text-indigo-600">
            <Music2 size={20} />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
            <p className="text-sm text-gray-500">{artist}</p>
          </div>
        </div>

        <p className="text-sm text-gray-700 mb-3">{description}</p>

        <SongTags tags={tags} />

        {/* spotify link */}
        {loading ? (
          <div className="flex justify-center items-center w-full mt-2">
            <Loader2 className="h-8 w-8 text-purple-600 animate-spin" />
            <span className="ml-2 text-gray-600">
              Finding your perfect tracks...
            </span>
          </div>
        ) : (
          <div className="flex flex-col gap-2 mt-4">
            {spotifyId && (
              <div className="w-full mt-2">
                <iframe
                  src={`https://open.spotify.com/embed/track/${spotifyId}?utm_source=generator&theme=0`}
                  width="100%"
                  height="80"
                  frameBorder="0"
                  allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                  allowFullScreen
                  title={`Spotify: ${title}`}
                />
              </div>
            )}

            {/* icons Section */}

            <div className="flex items-center justify-between mt-4">
              <div className="flex items-center gap-4">
                <a
                  href={'#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-green-500 hover:opacity-80"
                  onClick={handleSpotifyClick}
                >
                  <FaSpotify size={24} />
                </a>

                <a
                  href={'youtubeUrl'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-red-500 hover:opacity-80"
                  onClick={(e) => e.stopPropagation()}
                >
                  <FaYoutube size={24} />
                </a>
              </div>

              <label
                className="flex items-center space-x-1 text-sm font-medium text-gray-800 cursor-pointer"
                onClick={(e) => e.stopPropagation()}
              >
                <span>Select song</span>
                <input
                  type="checkbox"
                  checked={selected}
                  onChange={(e) => onSelect?.(e.target.checked)}
                  className="accent-indigo-600"
                />
              </label>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}
