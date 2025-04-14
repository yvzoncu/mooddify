'use client';

import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { useEmotion } from '@/contexts/EmotionContext';

export default function TagsCard() {
  const { flavorTags, selectedTags, toggleTag } = useEmotion();
  const [customTag, setCustomTag] = useState('');

  return (
    <Card className="w-full max-w-lg shadow-xl m-5 bg-gray-50">
      <CardContent className="space-y-6 p-6">
        <div className="space-y-4 flex flex-col justify-center">
          <h2 className="text-xl font-bold text-gray-900">
            Sprinkle Some Spice 🌶️
          </h2>
          <p className="text-sm text-gray-500">
            Add flavor tags to capture the nuance of your mood
          </p>
        </div>

        {/* Auto-generated tags */}
        <div className="flex flex-wrap gap-2 mb-4">
          {flavorTags.map((tag) => (
            <button
              key={tag}
              onClick={() => toggleTag(tag)}
              className={`px-3 py-1 rounded-full text-sm transition-all duration-300
                ${
                  selectedTags.includes(tag)
                    ? 'bg-indigo-100 text-indigo-800 border border-indigo-300 transform scale-105 shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
            >
              {tag}
            </button>
          ))}
        </div>

        {/* Sselected tags */}
        {selectedTags.length > 0 && (
          <div className="mt-4 p-3 bg-indigo-50 rounded-lg">
            <h3 className="font-medium text-indigo-800 mb-2">
              Your selected tags:
            </h3>
            <div className="flex flex-wrap gap-2">
              {selectedTags.map((tag) => (
                <span
                  key={tag}
                  onClick={() => toggleTag(tag)}
                  className="cursor-pointer px-2 py-1 bg-white text-indigo-800 text-sm rounded-full border border-indigo-200 hover:bg-gray-100"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Add custom tag */}
        <div className="flex gap-2 mt-4">
          <input
            type="text"
            value={customTag}
            onChange={(e) => setCustomTag(e.target.value)}
            onClick={() => {
              setCustomTag('#');
            }}
            placeholder="Add your own tag..."
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            onKeyDown={(e) => e.key === 'Enter' && toggleTag(customTag)}
          />
          <button
            onClick={() => {
              toggleTag(customTag);
              setCustomTag('');
            }}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Add
          </button>
        </div>
      </CardContent>
    </Card>
  );
}
