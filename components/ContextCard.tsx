'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { useEmotion } from '@/contexts/EmotionContext';
import { contextOptions } from '@/types/emotion-types';

export default function ContextCard() {
  const { selectedContexts, toggleContext } = useEmotion();

  return (
    <Card className="w-full max-w-lg shadow-xl m-5 bg-gray-50">
      <CardContent className="space-y-6 p-6">
        <div className="space-y-4 flex flex-col justify-center">
          <h2 className="text-xl font-bold text-gray-900">
            Whats Fueling This Mood? 🧩
          </h2>
          <p className="text-sm text-gray-500">
            Select 1-3 factors influencing your mood
          </p>
        </div>

        <div className="grid grid-cols-3 gap-4">
          {contextOptions.map((option) => (
            <button
              key={option.id}
              onClick={() => toggleContext(option.id)}
              className={`flex flex-col items-center justify-center p-4 rounded-lg transition-all duration-300
              ${
                selectedContexts.includes(option.id)
                  ? 'bg-white shadow-lg border-2 border-blue-500 transform scale-110'
                  : 'bg-gray-100 hover:bg-gray-200 border-2 border-transparent'
              }`}
              aria-label={option.label}
            >
              <span
                className={`text-3xl mb-2 transition-all duration-300 ${
                  selectedContexts.includes(option.id) ? 'scale-110' : ''
                }`}
                style={{
                  filter: selectedContexts.includes(option.id)
                    ? 'drop-shadow(0 0 4px rgba(0,0,0,0.2))'
                    : 'none',
                }}
              >
                {option.emoji}
              </span>
              <span className="text-sm font-medium text-gray-700">
                {option.label}
              </span>
            </button>
          ))}
        </div>

        {selectedContexts.length > 0 && (
          <div className="mt-6">
            <div className="flex justify-center gap-3 mb-4">
              {selectedContexts.map((id) => {
                const option = contextOptions.find((o) => o.id === id);
                return (
                  <div
                    key={id}
                    className="flex items-center justify-center w-12 h-12 rounded-full bg-white shadow-sm border-2 border-blue-500"
                    style={{ backgroundColor: `${option?.color}20` }}
                  >
                    <span className="text-2xl">{option?.emoji}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
