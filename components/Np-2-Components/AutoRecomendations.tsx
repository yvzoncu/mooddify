import React, { useState } from 'react';
import { useEmotion } from '@/contexts/EmotionContext';
import { Button } from '@/components/ui/button';
import { Loader2, Search } from 'lucide-react';
import axios from 'axios';
import { Input } from '@/components/ui/input';
import { Song } from '@/types/emotion-types';
import SongCard from '@/components/Np-2-Components/SongCard';

const API_CONFIG = {
  MISTRAL_API_KEY: 'RXuqVFz52CqZ61kRjLWtzcMgfdoCNV3z',
};

export default function AutoRecommendationCard() {
  const {
    selectedEmotion,
    intensity,
    selectedTags,
    selectedContexts,
    selectedSongs,
    songs,
    setSongs,
    toggleSelection,
  } = useEmotion();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [customRequest, setCustomRequest] = useState('');
  const [customLoading, setCustomLoading] = useState(false);
  const isSelectionIncomplete =
    !selectedEmotion ||
    intensity == null ||
    !selectedTags?.length ||
    !selectedContexts?.length;

  // Function to safely parse JSON with proper error handling
  const safeJsonParse = (jsonString: string): { songs: Song[] } => {
    try {
      return JSON.parse(jsonString);
    } catch (parseError) {
      console.error('Initial JSON parsing error:', parseError);

      try {
        const cleanedJson = jsonString
          // Remove control characters
          .replace(/[\u0000-\u001F\u007F-\u009F]/g, '')
          // Fix invalid escapes like \_ => _
          .replace(/\\_/g, '_')
          // Escape lone backslashes
          .replace(/\\(?!["\\/bfnrtu])/g, '\\\\')
          // Replace newlines and tabs with space
          .replace(/[\n\r\t]/g, ' ')
          .trim();

        return JSON.parse(cleanedJson);
      } catch (secondError) {
        console.error('Cleaned JSON parse failed:', secondError);

        // Fallback regex-based extraction
        try {
          const songsData: Song[] = [];
          const songRegex =
            /"singer"\s*:\s*"([^"]+?)"\s*,\s*"song[_\\]*name"\s*:\s*"([^"]+?)"\s*,\s*"reason"\s*:\s*"([^"]+?)"/g;

          let match;
          while ((match = songRegex.exec(jsonString)) !== null) {
            songsData.push({
              artist: match[1],
              song: match[2],
              description: match[3],
              tags: match[4],
              selected: false,
            });
          }

          if (songsData.length > 0) {
            return { songs: songsData };
          }

          throw new Error('Regex match returned no results.');
        } catch (finalError) {
          console.error('All parsing methods failed:', finalError);
          throw new Error('Could not parse the API response.');
        }
      }
    }
  };

  const fetchSongs = async (
    customRequestText = '',
    number = 3
  ): Promise<Song[]> => {
    try {
      // 1. Create a prompt for Mistral

      const prompt = `
You are a professional music recommendation AI.
A user has described their emotional state as follows:
User is feeling ${selectedEmotion?.label} and is in ${selectedContexts
        .map((tag) => tag.label)
        .join(', ')} emotional state.
Selected tags by the user are ${selectedTags.join(', ')}  

${customRequestText ? `- Additional request: ${customRequestText}` : ''}

Analyse users emotional state, Influencing factors, Selected tags${
        customRequestText ? ', users additional request' : ''
      }  seperattely andd carefully and suggest ${number} songs that best fit for the user.
if user has Additional request prioritise the custom request.
Your suggestions should fullfill all reequest crriterias

Searh the web and for each song, return:
- artist: Artist name
- title: Track title or song name
- description: A short (max 100 words) explanation why the song is a good match and suggested to the user
-tags: find 3 keywords from description comma seperated

Return your response as **raw, valid JSON only**, in this exact format:
{
  "songs": [
    {
      "artist": "Artist",
      "title": "Song name",
      "description": "Short explanation (max 100 words)",
      tags: "3 comma seperated keywords from description"
    }
  ]
}
Do not include any markdown, extra text, or formatting outside the JSON block.
`;
      console.log(prompt);
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
      console.log(raw);

      // Extract the JSON part from the response
      const jsonMatch = raw.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No valid JSON found in Mistral response');
      }

      // Use our safe JSON parser
      const parsed: { songs: Song[] } = safeJsonParse(jsonMatch[0]);
      return parsed.songs;
    } catch (err) {
      console.error('Error fetching songs:', err);
      throw err;
    }
  };

  const handleSongRequest = async () => {
    setLoading(true);
    setError('');

    try {
      const songs = await fetchSongs();
      setSongs(songs);
    } catch {
      setError('Failed to fetch songs. Please try again. ');
    } finally {
      setLoading(false);
    }
  };

  const handleCustomRequest = async () => {
    setCustomLoading(true);
    setError('');

    try {
      const song = await fetchSongs(customRequest.trim(), 1);
      const newSong = song[0];
      setSongs((prevSongs) => [...prevSongs, newSong]);
    } catch {
      setError('Failed to fetch songs. Please try again. ');
    } finally {
      setCustomLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-4 mt-20">
      {error && (
        <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm">
          {error}
        </div>
      )}

      <div className="space-y-4 flex flex-col justify-center">
        <h2 className="text-xl font-bold text-gray-900">
          4- Select best song represents your mood 🧩
        </h2>
      </div>

      {selectedSongs.length > 0 ? (
        <div className="p-3 bg-indigo-50 rounded-lg">
          <div className="flex flex-wrap gap-2 ">
            {selectedSongs.map((c, i) => {
              return (
                <div
                  key={i}
                  onClick={() => toggleSelection(c)}
                  className="cursor-pointer flex items-center gap-1 px-3 py-1 rounded-full bg-white shadow-sm border border-gray-200 hover:bg-gray-100"
                >
                  <span>{c.artist}</span>
                  <span> by </span>
                  <span className="text-sm">{c.song}</span>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <p className="text-sm text-gray-500">
          Select 1-3 songs from the ssuggested list
        </p>
      )}

      {songs.length > 0 && (
        <div className="mt-4 space-y-4">
          <h3 className="font-semibold">Suggested Tracks:</h3>
          {songs.map((song, i) => (
            <SongCard
              key={i}
              song={song.song}
              artist={song.artist}
              description={song.description}
              tags={song.tags}
              selected={selectedSongs.includes(song)}
              onSelect={() => toggleSelection(song)}
            />
          ))}
        </div>
      )}

      <div className="flex justify-center mt-4">
        {!loading && songs.length === 0 ? (
          <div className="relative group inline-block">
            <Button
              onClick={() => handleSongRequest()}
              disabled={isSelectionIncomplete}
              className={`text-white ${
                isSelectionIncomplete
                  ? 'bg-gray-600 cursor-not-allowed'
                  : 'bg-indigo-600 hover:bg-indigo-700'
              }`}
            >
              Get Song Recommendations
            </Button>

            {isSelectionIncomplete && (
              <div className="absolute bottom-full mb-2 w-max left-1/2 -translate-x-1/2 bg-gray-700 text-white text-sm px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10">
                Please complete your selections first
              </div>
            )}
          </div>
        ) : loading || customLoading ? (
          <div className="flex justify-center items-center py-8">
            <Loader2 className="h-8 w-8 text-purple-600 animate-spin" />
            <span className="ml-2 text-gray-600">
              Finding your perfect tracks...
            </span>
          </div>
        ) : (
          <div className="text-center w-full mt-6 space-y-4">
            {/* Motivational message */}
            <div className="space-y-2">
              <div className="text-2xl">🎯</div>
              <p className="text-gray-700 text-sm font-medium">
                Still hunting for the perfect tune? Try custom search use
                artist, song name topic etc. to find your perfect track
              </p>
            </div>

            {/* Search bar */}
            <div className="flex w-full space-x-2">
              <Input
                type="text"
                placeholder="Custom prompt. Ex: 'songs by Taylor Swift'"
                value={customRequest}
                onChange={(e) => setCustomRequest(e.target.value)}
                className="flex-1"
              />
              <Button
                onClick={handleCustomRequest}
                disabled={customLoading || !customRequest.trim()}
                className="cursor-pointer px-4 py-2 bg-indigo-700 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:bg-gray-400 disabled:text-white"
              >
                <Search className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
