import React, { useState, useEffect, useCallback } from 'react';
import { useEmotion } from '@/contexts/EmotionContext';
import SongCard from '@/components/Np-2-Components/SongCard';
import { Loader2 } from 'lucide-react';
import { Song } from '@/types/emotion-types';
import { ArrowRight } from 'lucide-react';

export default function SongPicker() {
  interface ApiSong {
    song: string;
    artist: string;
    average_top_similarity: number;
    max_similarity: number;
    total_top_similarity: number;
    final_score: number;
    count: number;
  }

  const { selectedSongs, toggleSelection, newTagInput, setIntensity } =
    useEmotion();
  const [loading, setLoading] = useState(false);
  const [apiSongs, setApiSongs] = useState<Song[]>([]);

  const fetchSongSuggestions = useCallback(async () => {
    if (!newTagInput) return;

    setLoading(true);
    try {
      const response = await fetch(
        `http://13.48.124.211/api/song-suggester?query=${newTagInput}&k=5`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch song suggestions');
      }

      const data = await response.json();
      console.log(data);

      if (data.results && Array.isArray(data.results)) {
        setApiSongs(
          data.results.map(
            (item: ApiSong): Song => ({
              song: String(item.song),
              artist: item.artist ? String(item.artist) : 'art',
              description: '',
              tags: null,
              final_score: String(item.final_score),
              selected: false,
            })
          )
        );
      }
    } catch (error) {
      console.error('Error fetching song suggestions:', error);
    } finally {
      setLoading(false);
    }
  }, [newTagInput]);

  useEffect(() => {
    if (!newTagInput || apiSongs.length > 0) return;
    fetchSongSuggestions();
  }, [newTagInput, apiSongs.length, fetchSongSuggestions]);

  return (
    <div>
      <div className="bg-gray-50  shadow-lg  rounded-lg p-6 w-full max-w-lg">
        <div className="flex flex-col space-y-4 ">
          {apiSongs.length > 0 &&
            apiSongs.map((song, index) => (
              <SongCard
                key={index}
                song={song.song}
                artist={song.artist}
                description={''}
                tags={'asdd, ggg'}
                selected={selectedSongs.includes(song)}
                onSelect={() => toggleSelection(song)}
              />
            ))}
        </div>
        <div className="flex justify-center w-lg mt-4">
          {loading && (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="h-8 w-8 text-purple-600 animate-spin" />
              <span className="ml-2 text-gray-600">
                Finding your perfect tracks...
              </span>
            </div>
          )}
        </div>
        <div className="flex justify-center mt-6">
          {!loading ? (
            <div className="flex justify-center mt-2">
              <button
                className="px-3 h-8 rounded-lg cursor-pointer flex items-center justify-center transition-all bg-purple-700"
                onClick={() => setIntensity(3)}
                aria-label="Continue to next step"
              >
                <span className="text-white text-md font-medium">Continue</span>
                <ArrowRight size={24} className="text-white" />
              </button>
            </div>
          ) : (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 text-white animate-spin" />
              <span className="ml-2 text-white">
                Finding your perfect tracks...
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
