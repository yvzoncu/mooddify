'use client';

import React, { useState } from 'react';

import { useEmotion } from '@/contexts/EmotionContext';
import { Button } from '@/components/ui/button';

export default function MoodSummaryCard() {
  const { selectedEmotion, intensity, selectedContexts, selectedSongs } =
    useEmotion();
  const [summary, setSummary] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const generateMoodSummary = async () => {
    setIsLoading(true);
    setSummary('');

    try {
      const baseEmotion = selectedEmotion?.label || 'a complex mix of feelings';
      const contextString = selectedContexts.length
        ? ` considering you're currently affected by ${selectedContexts.join(
            ', '
          )}`
        : '';
      const intensityDesc =
        intensity > 75 ? 'very intense' : intensity > 50 ? 'moderate' : 'mild';

      const generatedText = `You seem to be feeling ${baseEmotion.toLowerCase()} with a ${intensityDesc} intensity${contextString}. This moment reflects a deeply personal emotional state shaped by your current environment.`;

      await new Promise((resolve) => setTimeout(resolve, 800));

      setSummary(generatedText);
    } catch (error) {
      setSummary('Sorry, could not generate a mood summary. Please try again.');
      console.error('Mood generation error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-4 mt-20">
      <div className="space-y-2">
        <h2 className="text-xl font-bold text-gray-900 flex items-center">
          5- Your Mood Summary <span className="mr-2">🧠</span>
        </h2>
        <p className="text-sm text-gray-500">
          A reflection based on your emotion, context, tags and song(s).
        </p>

        {selectedSongs.length === 0 ? (
          <p className="text-red-600 font-medium mt-4 text-center">
            Select songs to get your mood summary
          </p>
        ) : (
          <>
            <ul className="text-sm text-gray-700 space-y-1 list-disc list-inside mt-4">
              {selectedSongs.map((song) => (
                <li key={song.artist}>
                  {song.song} by <span className="italic">{song.artist}</span>
                </li>
              ))}
            </ul>

            {!summary && (
              <div className="flex justify-center mt-4">
                <Button
                  onClick={generateMoodSummary}
                  disabled={isLoading}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white"
                >
                  {isLoading ? 'Generating...' : 'Generate Mood Summary'}
                </Button>
              </div>
            )}
          </>
        )}
      </div>

      {summary && (
        <div className="p-4 bg-indigo-50 text-indigo-800 rounded-md text-sm whitespace-pre-wrap">
          {summary}
        </div>
      )}
    </div>
  );
}
