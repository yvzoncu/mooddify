'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useEmotion } from '@/contexts/EmotionContext';
import { Loader2, Send } from 'lucide-react';

const API_CONFIG = {
  MISTRAL_API_KEY: 'RXuqVFz52CqZ61kRjLWtzcMgfdoCNV3z',
};

// Define the conversation item type
interface ConversationItem {
  type: 'user' | 'ai';
  content: string;
}

export default function TagsCard() {
  const { selectedTags, toggleTag, newTagInput, selectedSongs } = useEmotion();
  const [loading, setLoading] = useState(false);
  const [suggestedTag, setSuggestedTag] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [userComment, setUserComment] = useState('');
  // Specify the correct type for conversation state
  const [conversation, setConversation] = useState<ConversationItem[]>([]);
  const commentInputRef = useRef<HTMLInputElement>(null);
  const initialRenderRef = useRef(true);

  // Function to format text and highlight hashtags
  const formatTextWithHashtags = (text: string) => {
    if (!text) return '';

    // Use regex to match hashtags
    const regex = /(#\w+)/g;
    const parts = text.split(regex);

    return parts.map((part, index) => {
      if (part.match(regex)) {
        return (
          <span
            key={index}
            className="cursor-pointer px-2 py-1 bg-white text-indigo-800 text-sm rounded-full border border-indigo-200 hover:bg-gray-100 inline-block mx-1 my-1"
            onClick={() => toggleTag(part)}
          >
            {part}
          </span>
        );
      }
      return part;
    });
  };

  // Memoize the fetchSuggestedTags function to avoid dependency issues
  const fetchSuggestedTags = useCallback(
    async (userInput = '') => {
      let prompt;

      if (userInput) {
        prompt = `
        You are a friendly emotion analyser AI and will help the user describing their emotional state. 
        User is feeling like ${newTagInput} 

        User selected  ${selectedSongs.map((song) => song.song).join(', ')}

        In the previous prompt you generated below response to the user:
        ${suggestedTag}

        User would like to refine the previous answer. 
  
        User'n refinementt requesst is: "${userInput}"
  
        Based on the list of selected songs (including their titles, artists, and optional descriptions or tags), and the user's current emotional state, create a mood analysis.
       Use motivational, friendly, and emotionally supportive language. Highlight any positive emotional themes or uplifting elements in the songs. Offer gentle insights on how the music might resonate with the user's current feelings or help shift their mood positively.
        End with an encouraging message or reflection that makes the user feel understood and supported.
        Your answer cannoot be more than 150 words
      `;
      } else {
        prompt = `
        You are a friendly emotion analyser AI and will help the user describing their emotional state. 
        User is decibing feelings like: ${newTagInput} 

        Selected songs:  ${selectedSongs.map(
          (s, i) => `${i}-${s.song} by ${s.artist}`
        )}

        Based on the list of selected songs (including their titles, artists, and optional descriptions or tags), and the user's current emotional state, create a mood analysis.
        Use motivational, friendly, and emotionally supportive language. Highlight any positive emotional themes or uplifting elements in the songs. Offer gentle insights on how the music might resonate with the user's current feelings or help shift their mood positively.
        End with an encouraging message or reflection that makes the user feel understood and supported.
        Your answer cannot be more than 150 words

      `;
      }

      console.log(prompt);

      try {
        const response = await fetch(
          'https://api.mistral.ai/v1/chat/completions',
          {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${API_CONFIG.MISTRAL_API_KEY}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              model: 'mistral-medium',
              messages: [{ role: 'user', content: prompt }],
              temperature: 0.7,
              stream: true,
            }),
          }
        );

        if (!response.ok)
          throw new Error(`HTTP error! status: ${response.status}`);
        if (!response.body) throw new Error('Response body is null');

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        setIsStreaming(true);

        let currentResponse = '';
        let buffer = '';

        if (userInput) {
          // Add user message and placeholder AI message
          setConversation((prev) => [
            ...prev,
            { type: 'user', content: userInput },
            { type: 'ai', content: '' },
          ]);
        } else {
          // First time: reset suggestion and conversation
          setSuggestedTag('');
          setConversation([]);
        }

        while (true) {
          const { value, done } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          buffer += chunk;

          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            const trimmedLine = line.trim();
            if (!trimmedLine.startsWith('data: ')) continue;

            const data = trimmedLine.slice(6);
            if (data === '[DONE]') continue;

            try {
              const parsed = JSON.parse(data);
              const content = parsed.choices?.[0]?.delta?.content;

              if (content) {
                currentResponse += content;

                if (userInput) {
                  // Live-update last AI message in conversation
                  setConversation((prev) => {
                    const updated = [...prev];
                    const lastIndex = updated.length - 1;
                    if (updated[lastIndex]?.type === 'ai') {
                      updated[lastIndex] = {
                        ...updated[lastIndex],
                        content: currentResponse,
                      };
                    }
                    return updated;
                  });
                } else {
                  // First time: update suggestedTag
                  setSuggestedTag((prev) => prev + content);
                }
              }
            } catch {
              console.warn('Invalid JSON chunk. Skipping line.');
            }
          }
        }

        setIsStreaming(false);
      } catch (error) {
        console.error('Error fetching tags:', error);
        setIsStreaming(false);
      }
    },
    [newTagInput, selectedSongs, suggestedTag]
  ); // Add dependencies for useCallback

  // Run fetchSuggestedTags on page load if conditions are met
  useEffect(() => {
    // Only run on initial render
    if (initialRenderRef.current) {
      initialRenderRef.current = false;

      const hasInput = newTagInput && newTagInput.trim() !== '';
      const hasSongs = selectedSongs && selectedSongs.length > 0;

      // Only fetch if we have either input text or selected songs
      if (hasInput || hasSongs) {
        // Set loading state and fetch tags
        setLoading(true);
        fetchSuggestedTags().finally(() => {
          setLoading(false);
        });
      }
    }
  }, [newTagInput, selectedSongs, fetchSuggestedTags]); // Now fetchSuggestedTags is properly included

  const handleCommentSubmit = async () => {
    if (!userComment.trim()) return;

    setLoading(true);
    try {
      await fetchSuggestedTags(userComment);
      setUserComment('');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-4 mt-2 bg-gray-50  shadow-lg rounded-lg p-6 w-lg max-w-lg">
      <div className="space-y-4 flex flex-col justify-center">
        <h2 className="text-xl font-bold text-gray-900">
          Your Mood Summary 🌶️
        </h2>
        <p className="text-sm text-gray-500">
          A reflection based on your emotion and song(s).
        </p>
      </div>

      {/* prompts Display */}
      {selectedTags.length > 0 && (
        <div className="p-3 bg-indigo-50 rounded-lg">
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

      {/* Suggested Tags Display with highlighted hashtags */}
      {(suggestedTag || isStreaming) && (
        <div className="p-3 bg-indigo-50 rounded-lg text-sm text-gray-700">
          {suggestedTag ? (
            <div className="flex flex-wrap">
              {formatTextWithHashtags(suggestedTag)}
            </div>
          ) : (
            'Generating suggestions...'
          )}
          {isStreaming && (
            <span className="inline-block ml-1 animate-pulse">▌</span>
          )}
        </div>
      )}

      {/* Conversation History */}
      {conversation.length > 0 && (
        <div className="space-y-3">
          {conversation.map((item, index) => (
            <div
              key={index}
              className={`p-2 rounded-lg ${
                item.type === 'user'
                  ? 'bg-blue-50 text-blue-800 ml-8'
                  : 'bg-indigo-50 text-gray-700 mr-8'
              }`}
            >
              {item.type === 'user' ? (
                <p>{item.content}</p>
              ) : (
                <div className="flex flex-wrap">
                  {formatTextWithHashtags(item.content)}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Comment input - shown after initial streaming */}
      {suggestedTag && !isStreaming && (
        <div className="flex items-center gap-2 mt-2">
          <input
            ref={commentInputRef}
            type="text"
            value={userComment}
            onChange={(e) => setUserComment(e.target.value)}
            placeholder="Refine your mood..."
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && userComment.trim() !== '') {
                handleCommentSubmit();
              }
            }}
          />
          <button
            onClick={handleCommentSubmit}
            disabled={!userComment.trim() || loading}
            className="p-2 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 disabled:bg-gray-400"
          >
            {loading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Send className="h-5 w-5" />
            )}
          </button>
        </div>
      )}
    </div>
  );
}
