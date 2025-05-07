'use client';

import React from 'react';
import { useEmotion } from '@/contexts/EmotionContext';
import { Emotion, emotions } from '@/types/emotion-types';

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

  const getTextColor = () => {
    if (hoveredEmotion) return hoveredEmotion.text_color;
    if (selectedEmotion) return selectedEmotion.text_color;
    return '#1F2937'; // Default gray when nothing selected
  };

  // Get current label - shows hover label if available, otherwise selected label
  const getCurrentLabel = () => {
    if (hoveredEmotion) return hoveredEmotion.label;
    if (selectedEmotion) return selectedEmotion.label;
    return 'Select your mood';
  };

  // Handle emotion selection
  const handleEmotionSelect = (emotion: Emotion) => {
    setSelectedEmotion(emotion);
  };

  // Calculate position for elements in a circle
  const calculateCirclePosition = (
    index: number,
    total: number,
    radius: number
  ) => {
    const angle = (index * 2 * Math.PI) / total;
    const centerX = 160;
    const centerY = 160;
    const x = centerX + radius * Math.cos(angle);
    const y = centerY + radius * Math.sin(angle);
    return { x, y };
  };

  return (
    <div className="flex flex-col gap-4 mt-4">
      <h2 className="text-xl font-bold text-gray-900">
        1- Select Your Emotion 🌈
      </h2>
      {selectedEmotion === null ? (
        <p className="text-sm text-gray-500">
          Spin Your Mood! 😊 Select one of the core emotions.
        </p>
      ) : (
        <div className="p-3 bg-indigo-50 rounded-lg">
          <div className="flex flex-wrap gap-2">
            <>
              <span className="text-2xl mr-2">{selectedEmotion.emoji}</span>
              <span className="text-xl ">{selectedEmotion.label}</span>
            </>
          </div>
        </div>
      )}
      {/* showCircle true */}
      <div
        className="relative mx-auto flex items-center justify-center"
        style={{ width: '320px', height: '320px' }}
        role="group"
        aria-label="Emotion selection wheel"
      >
        {/* Central Circle */}
        <div
          className="absolute w-32 h-32 rounded-full flex items-center justify-center 
            transition-colors duration-500 shadow-md z-10"
          style={{ backgroundColor: getCircleColor() }}
          aria-live="polite"
        >
          <p
            className="text-l font-medium text-center px-4 truncate"
            style={{ color: getTextColor() }}
          >
            {getCurrentLabel()}
          </p>
        </div>

        {/* Emotion Icons */}
        {emotions.map((emotion, index) => {
          const pos = calculateCirclePosition(
            index,
            emotions.length,
            140 // Radius for emotions
          );

          // Check if this emotion is selected or hovered
          const isSelected = selectedEmotion?.id === emotion.id;
          const isHovered = hoveredEmotion?.id === emotion.id;
          const isActive = isSelected || isHovered;

          return (
            <button
              key={emotion.id}
              className={`absolute w-12 h-12 rounded-lg bg-white flex items-center justify-center
                  transition-all duration-300 cursor-pointer shadow-lg hover:shadow-xl border-2
                  ${
                    isActive
                      ? 'scale-125 shadow-xl z-10 border-white ring-2 ring-offset-2 ring-indigo-500'
                      : 'opacity-90 border-transparent'
                  }`}
              style={{
                left: `${pos.x}px`,
                top: `${pos.y}px`,
                transform: `translate(-50%, -50%) ${
                  isActive ? 'scale(1.25)' : ''
                }`,
              }}
              onClick={() => handleEmotionSelect(emotion)}
              onMouseEnter={() => setHoveredEmotion(emotion)}
              onMouseLeave={() => setHoveredEmotion(null)}
              aria-label={emotion.label}
            >
              <span className="text-2xl" aria-hidden="true">
                {emotion.emoji}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
