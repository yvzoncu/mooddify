'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { useEmotion } from '@/contexts/EmotionContext';
import { intensityPhrases } from '@/types/emotion-types';
import {
  Cloud,
  CloudSun,
  Sun,
  Sunset,
  CloudLightning,
  Clock,
} from 'lucide-react';

export default function IntensityCard() {
  const { intensity, setIntensity, selectedEmotion } = useEmotion();

  // Get the appropriate icon based on intensity level
  const IntensityIcon = () => {
    // If selectedEmotion is null, show a waiting/clock icon
    if (!selectedEmotion) {
      return <Clock className="text-gray-400" />;
    }

    // Otherwise show icons based on intensity with the selected emotion's color
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
    // If selectedEmotion is null, use a static gray background
    if (!selectedEmotion) {
      return 'bg-gray-100';
    }

    // Otherwise use the selected emotion's color with varying intensities
    if (intensity <= 20) return `bg-${selectedEmotion.color}-50`; // lighter
    if (intensity <= 40) return `bg-${selectedEmotion.color}-100`;
    if (intensity <= 60) return `bg-${selectedEmotion.color}-200`;
    if (intensity <= 80) return `bg-${selectedEmotion.color}-300`;
    return `bg-${selectedEmotion.color}-400`; // darker
  };

  // Get a background style for the slider
  const getSliderBackground = () => {
    if (!selectedEmotion) {
      // Gray gradient for the null case
      return 'linear-gradient(to right, #f3f4f6, #9ca3af)';
    }

    // Use the existing style but interpolated safely
    return `linear-gradient(to right, 
      ${selectedEmotion.color}33, 
      ${selectedEmotion.color}ff)`;
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
          className={`p-6 rounded-lg mb-4 flex items-center justify-between transition-all duration-300 ${getBgColorClass()}`}
        >
          <div className="text-lg font-semibold">
            {!selectedEmotion
              ? 'Select an emotion first'
              : Object.entries(intensityPhrases).reduce(
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
            backgroundImage: getSliderBackground(),
          }}
          disabled={!selectedEmotion}
        />
      </CardContent>
    </Card>
  );
}
