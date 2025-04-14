'use client';

import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { useEmotion } from '@/contexts/EmotionContext';
import { contextOptions } from '@/types/emotion-types';

export default function ContextCard() {
  const { selectedContexts, toggleContext } = useEmotion();
  const [customContext, setCustomContext] = useState('');

  // Function to add custom context
  const addCustomContext = () => {
    if (customContext.trim()) {
      toggleContext(customContext);
      setCustomContext('');
    }
  };

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
                  ? 'bg-white shadow-lg border-2 border-indigo-500 transform scale-110'
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

        {/* Selected Contexts Display - Similar to IntensityCard */}
        {selectedContexts.length > 0 && (
          <div className="mt-4 p-3 bg-indigo-50 rounded-lg">
            <h3 className="font-medium text-indigo-800 mb-2">
              Your selected factors:
            </h3>

            <div className="flex flex-wrap gap-2 mt-2">
              {selectedContexts.map((id) => {
                const option = contextOptions.find((o) => o.id === id);
                return option ? (
                  <div
                    key={id}
                    onClick={() => toggleContext(id)}
                    className="cursor-pointer flex items-center gap-1 px-3 py-1 rounded-full bg-white shadow-sm border border-gray-200 hover:bg-gray-100"
                  >
                    <span>{option.emoji}</span>
                    <span className="text-sm">{option.label}</span>
                  </div>
                ) : (
                  <div
                    key={id}
                    onClick={() => toggleContext(id)}
                    className="cursor-pointer flex items-center gap-1 px-3 py-1 rounded-full bg-white shadow-sm border border-gray-200 hover:bg-gray-100"
                  >
                    <span>✨</span>
                    <span className="text-sm">
                      {id.startsWith('custom-')
                        ? id.split('-')[2] || 'Custom'
                        : id}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Custom Context Input */}
        {selectedContexts.length < 3 && (
          <div className="mt-4 flex items-center gap-2">
            <input
              type="text"
              value={customContext}
              onChange={(e) => setCustomContext(e.target.value)}
              placeholder="Enter factor..."
              className="flex-1 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <button
              onClick={addCustomContext}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              disabled={!customContext.trim()}
            >
              Add
            </button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
