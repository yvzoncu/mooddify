'use client';

import React, { useState, useRef } from 'react';
import { useEmotion } from '@/contexts/EmotionContext';
import { Button } from '@/components/ui/button';
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
  const { selectedTags, toggleTag, selectedContexts, selectedEmotion } =
    useEmotion();
  const [loading, setLoading] = useState(false);
  const [suggestedTag, setSuggestedTag] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [userComment, setUserComment] = useState('');
  // Specify the correct type for conversation state
  const [conversation, setConversation] = useState<ConversationItem[]>([]);
  const commentInputRef = useRef<HTMLInputElement>(null);

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

  const fetchSuggestedTags = async (userInput = '') => {
    let prompt;

    if (userInput) {
      prompt = `
        You are a friendly tag finder AI and will help the user find the best tags describing their emotional state. 
        User is feeling ${selectedEmotion?.label} and is in ${selectedContexts
        .map((tag) => tag.label)
        .join(', ')} emotional state.
        In the previous prompt you generated below response to the user:
        ${suggestedTag}
  
        User'n new input is: "${userInput}"
  
        Thank the user for providing additional information. 
        Complete below tasks in order.
        1- Search for todays top hit songs from the web and find 50 songs.
        2- Filter songs which is related to the users new input.
        3- from filtered song names create 2 to 5 key words. Add user input as a hastag. keywords should start with #.
        Tags should be short, simple and should start with #
        Your suggestions cannot be longer than 100 words.
      `;
    } else {
      prompt = `
        You are a friendly tag finder AI and will help the user find the best tags describing their emotional state. 
        User is feeling ${selectedEmotion?.label} and is in ${selectedContexts
        .map((tag) => tag.label)
        .join(', ')} emotional state.
        Complete below tasks in order.
        1- Search for todays top hit songs from the web and find 50 songs.
        2- Filter songs which are related to the users felings and emotional state.
        3- from filtered song names create 5 to 10 key words.  keywords should start with #.
        Explain that if they can provide some details about why they feel that way, you’ll be able to create better tags.
        You can ask a simple, motivating, non-private question to understand their current emotional state.
        Your rssponse cannot be morre than 100 words
      `;
    }

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
  };

  const handleTagRequest = async () => {
    setLoading(true);
    try {
      await fetchSuggestedTags();
    } finally {
      setLoading(false);
    }
  };

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
    <div className="flex flex-col gap-4 mt-20">
      <div className="space-y-4 flex flex-col justify-center">
        <h2 className="text-xl font-bold text-gray-900">
          3- Sprinkle Your Mood With Some Spice 🌶️
        </h2>
        <p className="text-sm text-gray-500">
          Please select #hastags best explains why you feel{' '}
          {selectedContexts.map((tag) => tag.label).join(', ')} Selected tags
          will help us to find the best song for you.
        </p>
      </div>

      {/* Selected Tags Display */}
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
            placeholder="Tell more about your mood..."
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

      {/* Get Tags Button - only shown before any suggestions */}
      {!suggestedTag && !isStreaming && (
        <div className="flex justify-center mt-4">
          <Button
            onClick={handleTagRequest}
            disabled={selectedContexts.length === 0 || loading}
            className={`text-white ${
              selectedContexts.length === 0 || loading
                ? 'bg-gray-600 cursor-not-allowed'
                : 'bg-indigo-600 hover:bg-indigo-700'
            }`}
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Loading...
              </>
            ) : (
              'Get Sample Tags'
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
