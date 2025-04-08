'use client';

import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { useEmotion } from '@/contexts/EmotionContext';
import { Button } from '@/components/ui/button';
import { Song } from '@/types/emotion-types';
import { motion, AnimatePresence } from 'framer-motion';

export default function MusicRecommendationCard() {
  const { selectedEmotion, selectedContexts, intensity } = useEmotion();
  const [songs, setSongs] = useState<Song[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedSongs, setSelectedSongs] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [buttonText, setButtonText] = useState('Get Song Recommendations');

  const revealSongsOneByOne = async (newSongs: Song[]) => {
    setSongs([]);
    for (let i = 0; i < newSongs.length; i++) {
      await new Promise((res) => setTimeout(res, 300));
      setSongs((prev) => [...prev, newSongs[i]]);
    }
  };

  const getSongRecommendations = async () => {
    setIsLoading(true);
    setError(null);
    setButtonText('Finding songs...');
    try {
      if (!selectedEmotion) {
        setSongs([]);
        return;
      }

      let mockSongs: Song[] = [];

      switch (selectedEmotion.id) {
        case 'joy':
          mockSongs = [
            { id: '4cOdK2wGLETKBW3PvgPWqT', name: 'Happy - Pharrell Williams' },
            {
              id: '0TK2YIli7K1leLovkQiNik',
              name: 'Can’t Stop The Feeling - Justin Timberlake',
            },
            { id: '5HCyWlXZPP0y6Gqq8TgA20', name: 'Good as Hell - Lizzo' },
            {
              id: '6habFhsOp2NvshLv26DqMb',
              name: 'On Top of the World - Imagine Dragons',
            },
          ];
          break;

        case 'sadness':
          mockSongs = [
            { id: '4fbvXwMTXPWaFyaMWUm9CR', name: 'Someone Like You - Adele' },
            { id: '1R0a2iXumgCiFb7HEZ7gUE', name: 'Let Her Go - Passenger' },
            { id: '3YRCqOhFifThpSRFJ1VWFM', name: 'Fix You - Coldplay' },
            { id: '3xrn9i8zhNZsTtcoWgQEAd', name: 'Skinny Love - Bon Iver' },
          ];
          break;

        case 'anger':
          mockSongs = [
            {
              id: '7lQ8MOhq6IN2w8EYcFNSUk',
              name: 'Killing In The Name - Rage Against The Machine',
            },
            { id: '2PpruBYCo4H7WOBJ7Q2EwM', name: 'Break Stuff - Limp Bizkit' },
            {
              id: '1u8c2t2Cy7UBoG4ArRcF5g',
              name: 'Smells Like Teen Spirit - Nirvana',
            },
            { id: '3ZOEytgrvLwQaqXreDs2Jx', name: 'Stronger - Kanye West' },
          ];
          break;

        case 'excitement':
          mockSongs = [
            {
              id: '32OlwWuMpZ6b0aN2RZOeMS',
              name: 'Uptown Funk - Mark Ronson ft. Bruno Mars',
            },
            {
              id: '2Ks4Zf8syF5cEm7eiN9A1a',
              name: 'Feel This Moment - Pitbull ft. Christina Aguilera',
            },
            {
              id: '2gMXnyrvIjhVBUZwvLZDMP',
              name: 'Can’t Hold Us - Macklemore & Ryan Lewis',
            },
            { id: '0KSOMA3QVU94d8sPPz8KDz', name: 'Roar - Katy Perry' },
          ];
          break;

        case 'calm':
          mockSongs = [
            {
              id: '5qII2n90lVdGxzKBDHXD4U',
              name: 'Weightless - Marconi Union',
            },
            { id: '1A6OTy97kk0mMdm78rHsm8', name: 'Bloom - The Paper Kites' },
            { id: '3U4isOIWM3VvDubwSI3y7a', name: 'Holocene - Bon Iver' },
            {
              id: '3Fj47GNK2cM7e5p2TZC5gO',
              name: 'River Flows In You - Yiruma',
            },
          ];
          break;

        case 'boredom':
          mockSongs = [
            { id: '1Je1IMUlBXcx1Fz0WE7oPT', name: 'Wannabe - Spice Girls' },
            {
              id: '3AJwUDP919kvQ9QcozQPxg',
              name: 'Shake It Off - Taylor Swift',
            },
            { id: '4pbJqGIASGPr0ZpGpnWkDn', name: 'Tik Tok - Kesha' },
            { id: '0eGsygTp906u18L0Oimnem', name: 'Bohemian Rhapsody - Queen' },
          ];
          break;

        case 'confidence':
          mockSongs = [
            {
              id: '6Z8R6UsFuGXGtiIxiD8ISb',
              name: 'Run the World (Girls) - Beyoncé',
            },
            { id: '0e7ipj03S05BNilyu5bRzt', name: 'Stronger - Kelly Clarkson' },
            { id: '5jrdCoLpJSvHHorevXBATy', name: 'Just a Girl - No Doubt' },
            { id: '2PpruBYCo4H7WOBJ7Q2EwM', name: 'Confident - Demi Lovato' },
          ];
          break;

        default:
          mockSongs = [
            { id: '7qiZfU4dY1lWllzX7mPBI3', name: 'Shape of You - Ed Sheeran' },
            { id: '1f6fHxJ2VY74fZkGz2tqUQ', name: 'Perfect - Ed Sheeran' },
            {
              id: '1p80LdxRV74UKvL8gnD7ky',
              name: 'Counting Stars - OneRepublic',
            },
            {
              id: '3G69xSTyCNcZkT4zBT7Xaz',
              name: 'Love Me Like You Do - Ellie Goulding',
            },
          ];
      }

      await revealSongsOneByOne(mockSongs);
      setButtonText('Get New Recommendations');
    } catch (err) {
      console.error(err);
      setError('Failed to load recommendations. Try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleSelection = (id: string) => {
    setSelectedSongs((prev) => (prev.includes(id) ? [] : [id]));
  };

  return (
    <Card className="w-full max-w-lg shadow-lg m-5 bg-gray-50">
      <CardContent className="p-6 space-y-6">
        <div className="space-y-2">
          <h2 className="text-xl font-bold text-gray-900 flex items-center">
            <span className="mr-2">🎵</span> Music For Your Mood
          </h2>
          <p className="text-sm text-gray-500">
            Select the songs that match how you feel: {selectedEmotion?.emoji}{' '}
            {selectedEmotion?.label}
          </p>
        </div>

        {error && (
          <div className="p-4 bg-red-50 text-red-700 rounded-md text-sm">
            {error}
          </div>
        )}

        {songs.length > 0 && (
          <div className="space-y-4">
            <div className="space-y-4">
              <AnimatePresence>
                {songs.map((song) => (
                  <motion.div
                    key={song.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div
                      onClick={() => toggleSelection(song.id)}
                      className={`cursor-pointer border rounded-lg p-4 bg-white shadow-sm transform transition-all duration-300 hover:scale-105 ${
                        selectedSongs.includes(song.id)
                          ? 'border-blue-500 ring-2 ring-blue-200'
                          : 'border-gray-200'
                      }`}
                    >
                      <p className="font-medium text-gray-900">{song.name}</p>
                      <div className="w-full mt-2">
                        <iframe
                          src={`https://open.spotify.com/embed/track/${song.id}?utm_source=generator&theme=0`}
                          width="100%"
                          height="80"
                          frameBorder="0"
                          allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                          allowFullScreen
                          title={`Spotify: ${song.name}`}
                        />
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        )}

        <div className="flex justify-center mt-4">
          <Button
            onClick={getSongRecommendations}
            disabled={isLoading}
            className="bg-purple-600 hover:bg-purple-700 text-white"
          >
            {buttonText}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
