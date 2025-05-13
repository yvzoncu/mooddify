'use client';

import { useState, useCallback } from 'react';
import ChatHeader from '@/components/ChatComponents/ChatHeader';
import ChatInput from '@/components/ChatComponents/UserInput';
import SongCard from '@/components/ChatComponents/SongCard';
import { Song } from '@/types/MoodifyTypes';
import ChatAIMessage from '@/components/ChatComponents/ChatAIMessage';
import ChatUserMessage from '@/components/ChatComponents/ChatUserMessage';
import ChatLoadingMesage from '@/components/ChatComponents/ChatLoadingMessage';
import ChatSong from '@/components/ChatComponents/ChatSong';

interface ConversationItem {
  type: 'user' | 'ai' | 'loading' | 'song' | 'error';
  content: string;
  song?: Song;
}

interface SongSuggestion {
  song: string;
  artist: string;
  average_top_similarity: number;
  max_similarity: number;
  total_top_similarity: number;
  final_score: number;
  count: number;
}

interface ApiResponse {
  query: string;
  query_emotions: {
    label: string;
    score: number;
  }[];
  results: SongSuggestion[];
  search_type: string;
}

const API_CONFIG = {
  MISTRAL_API_KEY: 'RXuqVFz52CqZ61kRjLWtzcMgfdoCNV3z',
};

export default function MoodPlaylistUI() {
  const [showRightPanel, setShowRightPanel] = useState(false);
  const [firstPromptSent, setFirstPromptSent] = useState(false);

  const [inputText, setInputText] = useState('');
  const [selectedSongs, setSelectedSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(false);
  const [conversation, setConversation] = useState<ConversationItem[]>([]);

  // Function to fetch song suggestions from the API
  const fetchSongSuggestions = async (
    query: string
  ): Promise<ApiResponse | null> => {
    try {
      const response = await fetch(
        `http://13.48.124.211/api/new-song-suggester?query=${encodeURIComponent(
          query
        )}`
      );

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Error fetching song suggestions:', errorData);
        return null;
      }

      const data = await response.json();
      return data as ApiResponse;
    } catch (error) {
      console.error('Error fetching song suggestions:', error);
      return null;
    }
  };

  const generateResponseToUser = useCallback(
    async (userInput = '') => {
      if (!userInput.trim()) return;
      if (loading) return; // Prevent overlapping requests

      setFirstPromptSent(true);
      setLoading(true);

      // Step 1: Add user message and placeholder AI message
      setConversation((prev) => [
        ...prev,
        { type: 'user', content: userInput },
        { type: 'loading', content: '' },
      ]);

      try {
        const suggestionsData = await fetchSongSuggestions(userInput);
        console.log(suggestionsData);
        await new Promise((resolve) => setTimeout(resolve, 3000));

        if (!suggestionsData || !suggestionsData.results?.length) {
          setConversation((prev) => [
            ...prev.slice(0, -1), // Remove loading
            {
              type: 'error',
              content:
                "Sorry, I couldn't find any song suggestions for your mood right now. Please try again with a different description.",
            },
          ]);
          setLoading(false);
          return;
        }

        const suggestedSongs = suggestionsData.results
          .map((song) => `${song.song} by ${song.artist}`)
          .join(', ');

        const emotions = suggestionsData.query_emotions
          ? suggestionsData.query_emotions
              .map((e) => `${e.label} (${(e.score * 100).toFixed(1)}%)`)
              .join(', ')
          : 'N/A';

        const prompt = `
        You are a friendly song analyser AI. 
        Based on user input you will explain why these songs match their mood or emotional state.
        User input: ${userInput} 
        Detected emotions: ${emotions}
        Suggested songs: ${suggestedSongs}
        For each song explain why this song is suggested to the user. Use relational explanation between song, artist and user's emotional state.
        End each song analysis with song name and artist comma separated inside '#' symbol. Like '#Weightless,Marconi Union#'
        Each analysis cannot be more than 100 words.
      `;

        // Step 2: Remove 'loading', then add empty 'ai' response
        setConversation((prev) => [
          ...prev.slice(0, -1), // Remove 'loading'
          { type: 'ai', content: '' }, // Placeholder for streaming AI message
        ]);

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

        let currentResponse = '';
        let buffer = '';

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

                setConversation((prev) => {
                  const updated = [...prev];
                  // Update last message if it's an 'ai' message
                  const lastIndex = updated.length - 1;
                  if (updated[lastIndex]?.type === 'ai') {
                    updated[lastIndex] = {
                      ...updated[lastIndex],
                      content: currentResponse,
                    };
                  }
                  return updated;
                });
              }
            } catch {
              console.warn('Invalid JSON chunk. Skipping line.');
            }
          }
        }
      } catch (error) {
        console.error('Error generating response:', error);

        setConversation((prev) => [
          ...prev.slice(0, -1), // Remove loading or broken AI placeholder
          {
            type: 'error',
            content:
              'Sorry, I encountered an error while processing your request. Please try again.',
          },
        ]);
      } finally {
        setLoading(false);
      }
    },
    [loading]
  );

  const handleSongClick = (song: Song) => {
    setShowRightPanel(true);
    if (!selectedSongs.some((s) => s.spotifyId === song.spotifyId)) {
      setSelectedSongs([...selectedSongs, song]);
    }
  };

  const removeSelectedSong = (songName?: string) => {
    setSelectedSongs(selectedSongs.filter((song) => song.name !== songName));
  };

  const handleSongSelect = (song: Song) => {
    setShowRightPanel(true);
    setSelectedSongs((prev) =>
      prev.some((s) => s.name === song.name && s.artist === song.artist)
        ? prev
        : [...prev, song]
    );
  };

  return (
    <div className="flex flex-col h-screen bg-black text-white">
      <ChatHeader />
      <div className="flex-1 bg-black text-white overflow-hidden">
        {!showRightPanel ? (
          <div className="flex flex-col items-center justify-center h-full">
            {!firstPromptSent ? (
              <div className="flex flex-col items-center justify-center h-full  w-full max-w-xl">
                <p className="text-lg font-semibold mb-4">
                  Find your song based on your mood
                </p>

                <ChatInput
                  inputText={inputText}
                  setInputText={setInputText}
                  onSend={() => generateResponseToUser(inputText)}
                  onPlus={() => {}}
                  onGlobe={() => setShowRightPanel((prev) => !prev)}
                  loading={loading}
                  rightPanel={showRightPanel}
                />
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full">
                <div className="flex-1 p-4 overflow-y-auto w-full max-w-xl">
                  {conversation.map((msg, index) => (
                    <div key={index} className="mb-4">
                      {msg.type === 'user' ? (
                        <ChatUserMessage content={msg.content} />
                      ) : msg.type === 'ai' ? (
                        <ChatAIMessage
                          content={msg.content}
                          onSongSelect={handleSongSelect}
                        />
                      ) : msg.type === 'song' && msg.song ? (
                        <ChatSong
                          song={msg.song}
                          addSong={() => handleSongClick(msg.song!)}
                        />
                      ) : msg.type === 'loading' ? (
                        <ChatLoadingMesage />
                      ) : msg.type === 'error' ? (
                        <ChatAIMessage
                          content={msg.content}
                          onSongSelect={() => {}}
                        />
                      ) : null}
                    </div>
                  ))}
                </div>

                <ChatInput
                  inputText={inputText}
                  setInputText={setInputText}
                  onSend={() => generateResponseToUser(inputText)}
                  onPlus={() => {}}
                  onGlobe={() => setShowRightPanel((prev) => !prev)}
                  loading={loading}
                  rightPanel={showRightPanel}
                />
              </div>
            )}
          </div>
        ) : (
          <div className="flex w-full h-full">
            <div className="w-1/2 flex flex-col border-r border-gray-800 items-center overflow-y-auto">
              <div className="flex-1 p-4 overflow-y-auto w-full max-w-xl">
                {conversation.map((msg, index) => (
                  <div key={index} className="mb-4">
                    {msg.type === 'user' ? (
                      <ChatUserMessage content={msg.content} />
                    ) : msg.type === 'ai' ? (
                      <ChatAIMessage
                        content={msg.content}
                        onSongSelect={handleSongSelect}
                      />
                    ) : msg.type === 'song' && msg.song ? (
                      <ChatSong
                        song={msg.song}
                        addSong={() => handleSongClick(msg.song!)}
                      />
                    ) : msg.type === 'loading' ? (
                      <ChatLoadingMesage />
                    ) : msg.type === 'error' ? (
                      <ChatAIMessage
                        content={msg.content}
                        onSongSelect={() => {}}
                      />
                    ) : null}
                  </div>
                ))}
              </div>

              <ChatInput
                inputText={inputText}
                setInputText={setInputText}
                onSend={() => generateResponseToUser(inputText)}
                onPlus={() => {}}
                onGlobe={() => setShowRightPanel((prev) => !prev)}
                loading={loading}
                rightPanel={showRightPanel}
              />
            </div>

            <div className="w-1/2 bg-gray-900 flex flex-col items-start overflow-y-auto">
              <div className="p-6 w-full">
                <h1 className="text-2xl font-bold mb-4">Your Mood Playlist</h1>

                {selectedSongs.map((song, index) => (
                  <div
                    onClick={() => removeSelectedSong(song.name)}
                    key={index}
                    className={`${
                      index > 0 ? 'mt-4' : ''
                    } bg-gray-800 rounded-lg p-4 flex items-start w-full max-w-xl cursor-pointer`}
                  >
                    <SongCard
                      spotifyId={song.spotifyId}
                      title={song.name}
                      artist={song.artist}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
