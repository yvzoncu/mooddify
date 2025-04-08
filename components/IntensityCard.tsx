'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { useEmotion } from '@/contexts/EmotionContext';
import { intensityPhrases } from '@/types/emotion-types';

export default function IntensityCard() {
  const { intensity, setIntensity, selectedEmotion } = useEmotion();

  const getIntensityEmoji = (): string => {
    if (intensity <= 33) return '🌊';
    if (intensity <= 66) return '🌊🌊';
    return '🌊🌊🌊';
  };

  return (
    <Card className="w-full max-w-lg shadow-xl m-5 bg-gray-50">
      <CardContent className="space-y-6 p-6">
        <div className="space-y-4 flex flex-col justify-center">
          <h2 className="text-xl font-bold text-gray-900">
            Intensity Slider 🌈
          </h2>
          <p className="text-sm text-gray-500">How intense is it?</p>
        </div>

        {/* Intensity Control */}
        <div className="space-y-4">
          <div className="flex items-center justify-center gap-4 text-gray-700">
            <span className="text-xl">{getIntensityEmoji()}</span>
            <p className="text-lg font-medium">
              {Object.entries(intensityPhrases).reduce(
                (closest, [key, phrase]) =>
                  intensity >= Number(key) ? phrase : closest,
                ''
              )}
            </p>
          </div>

          <input
            type="range"
            min="0"
            max="100"
            value={intensity}
            onChange={(e) => setIntensity(Number(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-full appearance-none cursor-pointer"
            style={{
              backgroundImage: `linear-gradient(to right, 
                ${selectedEmotion.color}33, 
                ${selectedEmotion.color}ff)`,
            }}
          />
        </div>
      </CardContent>
    </Card>
  );
}
