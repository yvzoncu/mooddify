'use client';

import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { useEmotion } from '@/contexts/EmotionContext';
import { Button } from '@/components/ui/button';

export default function MoodSummaryCard() {
  const { selectedEmotion, selectedContexts, intensity } = useEmotion();
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
    <Card className="w-full max-w-lg shadow-lg m-5 bg-gray-50">
      <CardContent className="p-6 space-y-6">
        <div className="space-y-2">
          <h2 className="text-xl font-bold text-gray-900 flex items-center">
            <span className="mr-2">🧠</span> Your Mood Summary
          </h2>
          <p className="text-sm text-gray-500">
            A reflection based on your emotion, intensity, context and song(s).
          </p>

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
        </div>

        {summary && (
          <div className="p-4 bg-indigo-50 text-indigo-800 rounded-md text-sm whitespace-pre-wrap">
            {summary}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
