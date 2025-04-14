import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { useEmotion } from '@/contexts/EmotionContext';
import { Button } from '@/components/ui/button';
import { Loader2, Search } from 'lucide-react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { intensityPhrases } from '@/types/emotion-types';

// NOTE: For production, these should be moved to a secure backend service
// that proxies the API calls to avoid exposing keys in client-side code
const API_CONFIG = {
  MISTRAL_API_KEY: 'RXuqVFz52CqZ61kRjLWtzcMgfdoCNV3z',
  SPOTIFY_CLIENT_ID: '8bf6cef1e2a24f9883431685c9861335',
  SPOTIFY_CLIENT_SECRET: '922fa04dd1274dbda39117e6aee66b70',
};

type Song = {
  singer: string;
  song_name: string;
  reason: string;
  spotify_id?: string | null;
};

export default function MusicRecommendationCard() {
  const {
    selectedEmotion,
    intensity,
    selectedTags,
    selectedContexts,
    selectedSongs,
    setSelectedSongs,
  } = useEmotion();
  const [songs, setSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [customRequest, setCustomRequest] = useState('');
  const [customLoading, setCustomLoading] = useState(false);
  const isSelectionIncomplete =
    !selectedEmotion ||
    intensity == null ||
    !selectedTags?.length ||
    !selectedContexts?.length;

  const toggleSelection = (id: string | null | undefined) => {
    if (!id) return;

    setSelectedSongs((prev: (string | null | undefined)[]) => {
      if (prev.includes(id)) {
        // If the id is already in the array, remove it
        return prev.filter((song) => song !== id);
      } else {
        // If the id is not in the array, add it
        return [...prev, id];
      }
    });
  };

  // Function to safely parse JSON with proper error handling
  const safeJsonParse = (jsonString: string): { songs: Song[] } => {
    try {
      return JSON.parse(jsonString);
    } catch (parseError) {
      console.error('Initial JSON parsing error:', parseError);

      // Try to fix common JSON issues
      try {
        // Replace invalid escape characters
        const cleanedJson = jsonString
          // Remove control characters
          .replace(/[\u0000-\u001F\u007F-\u009F]/g, '')
          // Fix common invalid escape: song\_name -> song_name
          .replace(/\\_/g, '_')
          // Escape lone backslashes
          .replace(/\\(?!["\\/bfnrtu])/g, '\\\\')
          // Escape unescaped quotes inside strings
          .replace(/([^\\])"/g, '$1\\"')
          // Replace newlines and tabs with space
          .replace(/[\n\r\t]/g, ' ')
          .trim();

        return JSON.parse(cleanedJson);
      } catch (secondError) {
        console.error('Failed to fix and parse JSON:', secondError);

        // Last resort: try to manually extract the song data
        try {
          // Simple regex-based extraction (this is a fallback)
          const songsData: Song[] = [];
          const songRegex =
            /"singer"\s*:\s*"([^"]*)"\s*,\s*"song_name"\s*:\s*"([^"]*)"\s*,\s*"reason"\s*:\s*"([^"]*)"/g;

          let match;
          while ((match = songRegex.exec(jsonString)) !== null) {
            songsData.push({
              singer: match[1],
              song_name: match[2],
              reason: match[3],
            });
          }

          if (songsData.length > 0) {
            return { songs: songsData };
          }

          throw new Error('Unable to extract song data');
        } catch (finalError) {
          console.error('All parsing methods failed:', finalError);
          throw new Error('Could not parse the API response');
        }
      }
    }
  };

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
      throw new Error('Could not authenticate with Spotify');
    }
  };

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
      console.log('Spotify API response:', resp.data);
      return track ? track.id : null;
    } catch (err) {
      console.error(
        `Failed to fetch Spotify ID for ${songName} by ${artist}:`,
        err
      );
      return null;
    }
  };

  const fetchSongs = async (customRequestText = '') => {
    setLoading(true);
    setError('');
    setSongs([]);

    try {
      // 1. Create a prompt for Mistral
      const prompt = `
You are a music recommendation AI.

A user has described their emotional state as follows:
- Mood: "${selectedEmotion?.label || 'Unknown'}" ${selectedEmotion?.emoji || ''}
- Intensity: "${intensity || 'Medium'}"
- Influencing factors: ${
        selectedContexts?.length ? selectedContexts.join(', ') : 'None'
      }
- Hashtags: ${selectedTags?.length ? selectedTags.join(', ') : 'None'}
${customRequestText ? `- Additional request: ${customRequestText}` : ''}

Suggest 3 songs that best fit the user's emotional state${
        customRequestText ? ' and additional request' : ''
      }.

For each song, return:
- singer: Artist name
- song_name: Track title
- reason: A short (max 100 words) explanation why the song is a good match

Return your response as **raw, valid JSON only**, in this exact format:
{
  "songs": [
    {
      "singer": "Artist",
      "song_name": "Song",
      "reason": "Short explanation (max 100 words)"
    }
  ]
}
Do not include any markdown, extra text, or formatting outside the JSON block.
`;

      // 2. Get song recommendations from Mistral
      const mistralResponse = await axios.post(
        'https://api.mistral.ai/v1/chat/completions',
        {
          model: 'mistral-medium',
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.7,
        },
        {
          headers: {
            Authorization: `Bearer ${API_CONFIG.MISTRAL_API_KEY}`,
            'Content-Type': 'application/json',
          },
        }
      );

      const raw = mistralResponse.data.choices[0].message.content;

      // Extract the JSON part from the response
      const jsonMatch = raw.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No valid JSON found in Mistral response');
      }

      // Use our safe JSON parser
      const parsed: { songs: Song[] } = safeJsonParse(jsonMatch[0]);
      console.log(raw);

      // 3. Get Spotify token
      const spotifyToken = await getSpotifyToken();

      // 4. Enhance songs with Spotify IDs
      const songResults: Song[] = await Promise.all(
        parsed.songs.map(async (song) => {
          const id = await fetchSpotifyId(
            song.song_name,
            song.singer,
            spotifyToken
          );
          console.log(`Fetched Spotify ID for ${song.song_name}: ${id}`);
          return { ...song, spotify_id: id };
        })
      );

      setSongs(songResults);
    } catch (err) {
      console.error('Error fetching songs:', err);
      setError('Failed to fetch song recommendations. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const fetchAdditionalSong = async (customRequestText: string) => {
    if (!customRequestText.trim()) return;

    setCustomLoading(true);
    setError('');

    try {
      // 1. Create a prompt for Mistral
      const prompt = `
You are a music recommendation AI.

A user has described their emotional state as follows:
- Mood: "${selectedEmotion?.label || 'Unknown'}" ${selectedEmotion?.emoji || ''}
- Intensity: "${intensity || 'Medium'}"
- Influencing factors: ${
        selectedContexts?.length ? selectedContexts.join(', ') : 'None'
      }
- Hashtags: ${selectedTags?.length ? selectedTags.join(', ') : 'None'}
- Additional request: ${customRequestText}

Suggest 1 song that best fits the user's request: "${customRequestText}" while considering their emotional state.

For each song, return:
- singer: Artist name
- song_name: Track title
- reason: A short (max 100 words) explanation why the song is a good match

Return your response as **raw, valid JSON only**, in this exact format:
{
  "songs": [
    {
      "singer": "Artist",
      "song_name": "Song",
      "reason": "Short explanation (max 100 words)"
    }
  ]
}
Do not include any markdown, extra text, or formatting outside the JSON block.
`;

      // 2. Get song recommendation from Mistral
      const mistralResponse = await axios.post(
        'https://api.mistral.ai/v1/chat/completions',
        {
          model: 'mistral-medium',
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.7,
        },
        {
          headers: {
            Authorization: `Bearer ${API_CONFIG.MISTRAL_API_KEY}`,
            'Content-Type': 'application/json',
          },
        }
      );

      const raw = mistralResponse.data.choices[0].message.content;
      console.log(raw);

      // Extract the JSON part from the response
      const jsonMatch = raw.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No valid JSON found in Mistral response');
      }

      // Use our safe JSON parser
      const parsed: { songs: Song[] } = safeJsonParse(jsonMatch[0]);

      // 3. Get Spotify token
      const spotifyToken = await getSpotifyToken();

      // 4. Enhance song with Spotify ID
      const newSong = parsed.songs[0];
      const id = await fetchSpotifyId(
        newSong.song_name,
        newSong.singer,
        spotifyToken
      );
      const songWithId = { ...newSong, spotify_id: id };

      // 5. Add the new song to the existing list
      setSongs((prevSongs) => [...prevSongs, songWithId]);
    } catch (err) {
      console.error('Error fetching additional song:', err);
      setError('Failed to fetch additional song. Please try again later.');
    } finally {
      setCustomLoading(false);
    }
  };

  const handleCustomRequest = () => {
    if (customRequest.trim()) {
      fetchAdditionalSong(customRequest);
      setCustomRequest('');
    }
  };

  return (
    <Card className="w-full max-w-lg shadow-lg m-5 bg-gray-50">
      <CardContent className="p-6 space-y-6">
        <div className="space-y-2">
          <h2 className="text-xl font-bold text-gray-900 flex items-center">
            <span className="mr-2">🎵</span> Find Song For Your Mood
          </h2>
        </div>

        <div className="text-center py-2 text-gray-600">
          {/* Emotion Header */}
          {!selectedEmotion ? (
            <p className="text-base text-red-500 font-medium">
              Select your emotion
            </p>
          ) : (
            <div className="flex items-center justify-center gap-3 text-lg mb-4">
              <span className="text-3xl">{selectedEmotion.emoji}</span>
              <span className="font-semibold text-xl">
                {selectedEmotion.id}
              </span>
              <span className="text-gray-400">•</span>
              <span className="text-indigo-500">
                {Object.entries(intensityPhrases).reduce(
                  (closest, [key, phrase]) =>
                    intensity >= Number(key) ? phrase : closest,
                  ''
                )}
              </span>
            </div>
          )}

          {/* Categories */}
          {!selectedContexts?.length ? (
            <p className="text-base text-red-500 font-medium">
              Select factors influencing your mood.
            </p>
          ) : (
            <div className="flex justify-center items-center gap-4 mb-6">
              {selectedContexts.map((category, index) => (
                <div
                  key={index}
                  className="flex items-center text-sm text-gray-700 font-medium"
                >
                  {index === 0 && <span className="mr-2">🎵</span>}
                  {index === 1 && <span className="mr-2">👥</span>}
                  {index === 2 && <span className="mr-2">💼</span>}
                  {category}
                </div>
              ))}
            </div>
          )}

          {/* Tags */}
          {!selectedTags?.length ? (
            <p className="text-base text-red-500 font-medium">Select tags</p>
          ) : (
            <div className="flex flex-wrap gap-3 justify-center mb-6">
              {selectedTags.map((tag, index) => (
                <span
                  key={index}
                  className="bg-indigo-100 text-indigo-600 px-4 py-2 rounded-full text-sm font-medium"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm">
            {error}
          </div>
        )}

        {songs.length > 0 && (
          <div className="mt-4 space-y-3">
            <h3 className="font-semibold">Suggested Tracks:</h3>
            {songs.map((song, i) => (
              <motion.div
                key={`${song.singer}-${song.song_name}-${i}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div
                  onClick={() => toggleSelection(song.spotify_id)}
                  className={`cursor-pointer border rounded-lg p-4 bg-white shadow-sm transform transition-all duration-300 hover:scale-105 ${
                    selectedSongs.includes(song.spotify_id)
                      ? 'border-indigo-500 ring-2 ring-indigo-200'
                      : 'border-gray-200'
                  }`}
                >
                  <div className="font-medium">
                    {song.song_name} by {song.singer}
                  </div>
                  <div className="w-full mt-2">
                    <iframe
                      src={`https://open.spotify.com/embed/track/${song.spotify_id}?utm_source=generator&theme=0`}
                      width="100%"
                      height="80"
                      frameBorder="0"
                      allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                      allowFullScreen
                      title={`Spotify: ${song.song_name}`}
                    />
                  </div>
                  <div className="text-sm text-gray-600 mt-2">
                    {song.reason}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {!loading && songs.length === 0 && !error && (
          <div className="text-center text-gray-600">
            {isSelectionIncomplete ? (
              <p className="text-base text-gray-500 font-medium">
                Complete above selections to get recommendations.
              </p>
            ) : (
              <p className="text-base text-gray-500">
                Click the button below to get music recommendations based on
                your selections.
              </p>
            )}
          </div>
        )}

        <div className="flex justify-center mt-4">
          {!loading && songs.length === 0 ? (
            isSelectionIncomplete ? null : (
              <Button
                onClick={() => fetchSongs()}
                disabled={loading}
                className="bg-indigo-600 hover:bg-indigo-600 text-white"
              >
                Get Song Recommendations
              </Button>
            )
          ) : loading || customLoading ? (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="h-8 w-8 text-purple-600 animate-spin" />
              <span className="ml-2 text-gray-600">
                Finding your perfect tracks...
              </span>
            </div>
          ) : (
            <div className="flex w-full space-x-2">
              <Input
                type="text"
                placeholder="Custom prompt. Ex: 'songs by Taylor Swift'"
                value={customRequest}
                onChange={(e) => setCustomRequest(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleCustomRequest()}
                className="flex-1"
              />
              <Button
                onClick={handleCustomRequest}
                disabled={customLoading || !customRequest.trim()}
                className="bg-indigo-600 hover:bg-indigo-700 text-white"
              >
                <Search className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
