'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { useEmotion } from '@/contexts/EmotionContext';
import { contextOptions, intensityPhrases } from '@/types/emotion-types';

export default function SummaryCard() {
  const { selectedEmotion, intensity, selectedContexts } = useEmotion();

  const getSelectedContextLabels = () => {
    return selectedContexts.map((id) => {
      const option = contextOptions.find((o) => o.id === id);
      return option ? option.label : '';
    });
  };

  return (
    <Card className="w-full max-w-lg shadow-xl m-5 bg-gray-50">
      <CardContent className="space-y-6 p-6">
        <div className="mt-4 p-4 bg-white rounded-lg shadow-sm">
          <h3 className="font-semibold text-lg mb-3">Selections:</h3>
          <ol className="list-decimal pl-5 space-y-2">
            <li>
              <span className="font-medium">Emotion:</span>{' '}
              {selectedEmotion.emoji} {selectedEmotion.label}
            </li>
            <li>
              <span className="font-medium">Intensity:</span> {intensity}% -{' '}
              {Object.entries(intensityPhrases).reduce(
                (closest, [key, phrase]) =>
                  intensity >= Number(key) ? phrase : closest,
                ''
              )}
            </li>
            {selectedContexts.length > 0 && (
              <>
                <li>
                  <span className="font-medium">Contexts:</span>
                  <ul className="list-disc pl-5 mt-1">
                    {getSelectedContextLabels().map((label, index) => (
                      <li key={index}>{label}</li>
                    ))}
                  </ul>
                </li>
              </>
            )}
          </ol>
        </div>
      </CardContent>
    </Card>
  );
}
