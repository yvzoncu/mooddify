'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { useEmotion } from '@/contexts/EmotionContext';
import { intensityPhrases } from '@/types/emotion-types';
import { Cloud, CloudSun, Sun, Sunset, CloudLightning } from 'lucide-react';

export default function IntensityCard() {
  const { intensity, setIntensity, selectedEmotion } = useEmotion();

  // Get the appropriate icon based on intensity level
  const IntensityIcon = () => {
    if (intensity <= 10)
      return <Cloud className={`text-${selectedEmotion.color}-300`} />;
    if (intensity <= 25)
      return <CloudSun className={`text-${selectedEmotion.color}-400`} />;
    if (intensity <= 50)
      return <Sun className={`text-${selectedEmotion.color}-500`} />;
    if (intensity <= 75)
      return <Sunset className={`text-${selectedEmotion.color}-600`} />;
    return <CloudLightning className={`text-${selectedEmotion.color}-700`} />;
  };

  // Get background color intensity based on slider value
  const getBgColorClass = () => {
    if (intensity <= 20) return `bg-${selectedEmotion.color}-50`; // lighter
    if (intensity <= 40) return `bg-${selectedEmotion.color}-100`;
    if (intensity <= 60) return `bg-${selectedEmotion.color}-200`;
    if (intensity <= 80) return `bg-${selectedEmotion.color}-300`;
    return `bg-${selectedEmotion.color}-400`; // darker
  };

  return (
    <Card className="w-full max-w-lg shadow-xl m-5 bg-white">
      <CardContent className="space-y-6 p-6">
        <div className="mb-2">
          <h2 className="text-xl font-bold text-gray-900">
            Intensity Meter 🌈
          </h2>
          <p className="text-sm text-gray-500">How intense is it?</p>
        </div>

        {/* Intensity Display Card */}
        <div
          className="p-6 rounded-lg mb-4 flex items-center justify-between transition-all duration-300"
          style={{ backgroundColor: `var(--${getBgColorClass()})` }}
        >
          <div className="text-lg font-semibold">
            {Object.entries(intensityPhrases).reduce(
              (closest, [key, phrase]) =>
                intensity >= Number(key) ? phrase : closest,
              ''
            )}
          </div>
          <div className="text-3xl">
            <IntensityIcon />
          </div>
        </div>

        {/* Slider Control */}

        <input
          type="range"
          min="0"
          max="100"
          value={intensity}
          onChange={(e) => setIntensity(Number(e.target.value))}
          className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          style={{
            backgroundImage: `linear-gradient(to right, 
              ${selectedEmotion.color}33, 
              ${selectedEmotion.color}ff)`,
          }}
        />
      </CardContent>
    </Card>
  );
}
