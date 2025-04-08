'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { useEmotion } from '@/contexts/EmotionContext';

export default function TagsCard() {
  const {
    flavorTags,
    userAddedTags,
    selectedTags,
    newTagInput,
    setNewTagInput,
    toggleTag,
    addCustomTag,
  } = useEmotion();

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
                    ? 'bg-blue-100 text-blue-800 border border-blue-300 transform scale-105 shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
            >
              {tag}
            </button>
          ))}
        </div>

        {/* User-added tags */}
        {userAddedTags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {userAddedTags.map((tag) => (
              <button
                key={tag}
                onClick={() => toggleTag(tag)}
                className={`px-3 py-1 rounded-full text-sm transition-all duration-300
                  ${
                    selectedTags.includes(tag)
                      ? 'bg-purple-100 text-purple-800 border border-purple-300 transform scale-105 shadow-md'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
              >
                {tag}
              </button>
            ))}
          </div>
        )}

        {/* Add custom tag */}
        <div className="flex gap-2 mt-4">
          <input
            type="text"
            value={newTagInput}
            onChange={(e) => setNewTagInput(e.target.value)}
            placeholder="Add your own tag..."
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            onKeyDown={(e) => e.key === 'Enter' && addCustomTag()}
          />
          <button
            onClick={addCustomTag}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Add
          </button>
        </div>

        {selectedTags.length > 0 && (
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <h3 className="font-medium text-blue-800 mb-2">
              Your selected tags:
            </h3>
            <div className="flex flex-wrap gap-2">
              {selectedTags.map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-1 bg-white text-blue-800 text-sm rounded-full border border-blue-200"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
