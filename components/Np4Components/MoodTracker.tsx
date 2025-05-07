'use client';

import { useState } from 'react';
import { Plus, Mic } from 'lucide-react';
import { userEmotions } from '@/types/emotion-types';
import { useEmotion } from '@/contexts/EmotionContext';
import { ArrowUp, ArrowRight } from 'lucide-react';

export default function MoodTracker() {
  const { newTagInput, setNewTagInput, setIntensity } = useEmotion();

  interface Emotion {
    label: string;
    score: number;
  }

  interface EmotionResponse {
    success: boolean;
    text?: string;
    emotions?: Emotion[];
    error?: string;
    message?: string | string[];
    suggestion?: string;
  }

  const [queryEmotion, setQueryEmotion] = useState<EmotionResponse | null>(
    null
  );
  const [loading, setLoading] = useState(false);

  const emotionQuery = async () => {
    if (!newTagInput.trim()) {
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('http://13.48.124.211/api/predict', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: newTagInput }),
      });

      const data = await response.json();
      setQueryEmotion(data);
    } catch {
      setQueryEmotion({
        success: false,
        error: 'Connection error',
        message: 'Failed to connect to the emotion detection service.',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSpanClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const spanText = e.currentTarget.querySelector('span')?.innerText || '';
    setNewTagInput(spanText);
  };

  const getEmotionById = (id: string) => {
    return userEmotions.find((emotion) => emotion.id === id) || null;
  };

  return (
    <div>
      {/* Content Card */}
      <div className="bg-gray-50  shadow-lg rounded-lg p-6 w-lg max-w-lg">
        <h2 className="text-2xl  text-center mb-6">
          How are you feeling today?
        </h2>

        {/* Emoji Selection */}
        {!queryEmotion && (
          <div className="flex flex-wrap justify-center gap-4 mb-6">
            <div
              onClick={handleSpanClick}
              className="cursor-pointer flex items-center gap-1 px-3 py-1 rounded-full  
                        bg-gray-100 shadow-lg border-2 
                        border-purple-800  
                       "
            >
              <span className="text-sm"> I feel happy</span>
            </div>
            <div
              onClick={handleSpanClick}
              className="cursor-pointer flex items-center gap-1 px-3 py-1 rounded-full  
                        bg-gray-100 shadow-lg border-2 
                        border-purple-800  
                       "
            >
              <span className="text-sm"> Feeling angry find a song </span>
            </div>
            <div
              onClick={handleSpanClick}
              className="cursor-pointer flex items-center gap-1 px-3 py-1 rounded-full  
                        bg-gray-100 shadow-lg border-2 
                        border-purple-800  
                       "
            >
              <span className="text-sm"> My frind madde me mad </span>
            </div>
          </div>
        )}

        {/* query results */}

        {queryEmotion && (
          <div className="mt-6 border-t pt-4 pb-6">
            {queryEmotion.success ? (
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-gray-700 mb-2">
                    Detected Emotions:
                  </h3>
                  <div className="flex flex-wrap justify-center gap-4 mb-10 mt-4">
                    {queryEmotion?.emotions?.map((emotion, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-3 px-3 py-1 rounded-full  
                        bg-gray-100 shadow-lg border-2 
                        border-purple-800"
                      >
                        <span>{getEmotionById(emotion.label)?.emoji}</span>
                        <span className="font-medium capitalize">
                          {getEmotionById(emotion.label)?.label}
                        </span>
                        <span className="font-medium">
                          {Math.round(emotion.score * 100)}%
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Continue Button */}
                <div className="flex justify-center mt-2">
                  <button
                    className="px-3 h-8 rounded-lg cursor-pointer flex items-center justify-center transition-all  bg-purple-700"
                    onClick={() => setIntensity(2)}
                    aria-label="Continue to next step"
                  >
                    <span className="text-white text-md font-medium">
                      Continue
                    </span>
                    <ArrowRight size={24} className="text-white" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <h3 className="font-bold text-red-700 mb-2">
                  Error: {queryEmotion.error}
                </h3>

                {queryEmotion.message && Array.isArray(queryEmotion.message) ? (
                  <div className="mb-3">
                    <p className="text-gray-700 mb-1 font-medium">
                      Try examples like:
                    </p>
                    <ul className="list-disc pl-5 text-gray-600">
                      {queryEmotion.message.map((example, index) => (
                        <li key={index} className="mb-1">
                          <button
                            className="text-blue-600 hover:underline text-left"
                            onClick={() => {
                              setNewTagInput(example);
                            }}
                          >
                            {example}
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : (
                  <p className="text-gray-700 mb-3">{queryEmotion.message}</p>
                )}

                {queryEmotion.suggestion && (
                  <p className="text-sm font-medium text-gray-700">
                    Suggestion: {queryEmotion.suggestion}
                  </p>
                )}
              </div>
            )}
          </div>
        )}

        {/* input card */}
        <div className="w-full bg-purple-100 rounded-lg mb-6 p-2 flex flex-col space-y-2">
          {/* text input */}

          <div className="flex-1 px-2">
            <textarea
              className="w-full bg-transparent  placeholder-gray-400 focus:outline-none"
              placeholder="Express your feelings or current state of mind..."
              value={newTagInput}
              onChange={(e) => setNewTagInput(e.target.value)}
            />
          </div>

          {/* selecttions emotion */}
          <div className="w-full bg-inddigo-50 rounded-full mb-1 p-2 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <button className="p-2 text-gray-400 hover:text-gray-300">
                <Plus className="w-5 h-5" />
              </button>
              <button className="p-2 text-gray-400 hover:text-gray-300">
                <Mic className="w-5 h-5" />
              </button>
            </div>

            {/* send button */}
            <div className="flex items-center justify-center  ">
              <button
                onClick={emotionQuery}
                disabled={loading}
                className={`w-8 h-8 rounded-lg cursor-pointer flex items-center justify-center transition-all ${
                  loading ? 'bg-white' : ' bg-purple-700'
                }`}
              >
                {loading ? (
                  <div className="w-4 h-4 rounded-full border-2 border-gray-800 border-t-transparent animate-spin"></div>
                ) : (
                  <ArrowUp size={24} className="text-white" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
