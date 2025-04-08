'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { useEmotion } from '@/contexts/EmotionContext';
import { emotions } from '@/types/emotion-types';

export default function EmotionWheelCard() {
  const {
    selectedEmotion,
    setSelectedEmotion,
    hoveredEmotion,
    setHoveredEmotion,
  } = useEmotion();

  const getCircleColor = () => {
    if (hoveredEmotion) return hoveredEmotion.color;
    if (selectedEmotion) return selectedEmotion.color;
    return '#F3F4F6'; // Default gray when nothing selected
  };

  // Get current label - shows hover label if available, otherwise selected label
  const getCurrentLabel = () => {
    if (hoveredEmotion) return hoveredEmotion.label;
    if (selectedEmotion) return selectedEmotion.label;
    return 'Select your mood';
  };

  return (
    <Card className="w-full max-w-lg shadow-xl m-5 bg-gray-50">
      <CardContent className="space-y-6 p-6">
        <div className="space-y-4 flex flex-col justify-center">
          <h2 className="text-xl font-bold text-gray-900">Emotion Wheel 🌈</h2>
          <p className="text-sm text-gray-500">
            Spin Your Mood! 😊 Select one of the core emotions.
          </p>
        </div>

        {/* Emotion Wheel Container - Properly centered */}
        <div
          className="relative mx-auto flex items-center justify-center"
          style={{ width: '320px', height: '320px' }}
        >
          {/* Central Circle */}
          <div
            className="absolute w-32 h-32 rounded-full flex items-center justify-center 
            transition-colors duration-500 shadow-md z-0"
            style={{ backgroundColor: getCircleColor() }}
          >
            <p className="text-l font-medium text-gray-800 text-center px-4 truncate">
              {getCurrentLabel()}
            </p>
          </div>

          {/* Emotion Icons - Perfect circle with increased padding */}
          {emotions.map((emotion, index) => {
            // Calculate position in a perfect circle
            const totalEmotions = emotions.length;
            const angle = (index * 2 * Math.PI) / totalEmotions;

            // Increase radius for better padding between icons and center circle
            const radius = 140; // Increased from original

            // Calculate position relative to center point (160,160)
            const centerX = 160;
            const centerY = 160;
            const x = centerX + radius * Math.cos(angle);
            const y = centerY + radius * Math.sin(angle);

            return (
              <button
                key={emotion.id}
                className={`absolute w-12 h-12 rounded-lg bg-white flex items-center justify-center
                transition-all duration-300 cursor-pointer shadow-lg hover:shadow-xl border-2
                ${
                  selectedEmotion.id === emotion.id
                    ? 'scale-125 shadow-xl z-10 border-white ring-2 ring-offset-2 ring-blue-500'
                    : 'opacity-90 border-transparent'
                }`}
                style={{
                  left: `${x}px`,
                  top: `${y}px`,
                  transform: `translate(-50%, -50%) ${
                    selectedEmotion.id === emotion.id ? 'scale(1.25)' : ''
                  }`,
                }}
                onClick={() => setSelectedEmotion(emotion)}
                onMouseEnter={() => setHoveredEmotion(emotion)}
                onMouseLeave={() => setHoveredEmotion(null)}
                aria-label={emotion.label}
              >
                <span className="text-2xl">{emotion.emoji}</span>
              </button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
