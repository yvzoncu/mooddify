'use client';

import { useState, useCallback } from 'react';
import ChatHeader from '@/components/ChatComponents/ChatHeader';
import ChatInput from '@/components/ChatComponents/UserInput';
import SongCard from '@/components/ChatComponents/SongCard';
import { SongItem, ConversationItem } from '@/types/MoodifyTypes';
import ChatAIMessage from '@/components/ChatComponents/ChatAIMessage';
import ChatUserMessage from '@/components/ChatComponents/ChatUserMessage';
import ChatLoadingMesage from '@/components/ChatComponents/ChatLoadingMessage';
import ChatSong from '@/components/ChatComponents/ChatSong';
import EmotionMeter from '@/components/ListComponents/EmotionMeter';
import {
  fetchSongSuggestions,
  processSingleSong,
  getSelectedSongEmotionsList,
} from '@/utils/songUtils';
import { useAuth } from '@/contexts/AuthContext';

export default function MoodPlaylistUI() {
  const { user } = useAuth();
  const [showRightPanel, setShowRightPanel] = useState(false);
  const [firstPromptSent, setFirstPromptSent] = useState(false);
  const [inputText, setInputText] = useState('');
  const [selectedSongs, setSelectedSongs] = useState<SongItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [conversation, setConversation] = useState<ConversationItem[]>([]);
  const [selectedPlaylist, setSelectedPlaylist] = useState<number>();

  const addSongCardToConversation = (songItem: SongItem) => {
    setConversation((prev) => [
      ...prev,
      {
        type: 'song',
        content: '',
        song: songItem,
      },
    ]);
  };

  const processSongSuggestions = useCallback(
    async (userInput: string) => {
      if (!userInput.trim() || loading) return;

      setFirstPromptSent(true);
      setLoading(true);
      setConversation((prev) => [
        ...prev,
        { type: 'user', content: userInput },
        { type: 'loading', content: '' },
      ]);

      try {
        const apiResponse = await fetchSongSuggestions(
          userInput,
          user?.id || 'None'
        );
        if (!apiResponse || !apiResponse.items?.length) {
          setConversation((prev) => [
            ...prev.slice(0, -1),
            {
              type: 'error',
              content: `Sorry, I couldn't find song suggestions. Try a different mood or phrase.`,
            },
          ]);
          return;
        }

        const detectedEmotions = apiResponse.emotions
          .map((e) => {
            const name = Object.keys(e)[0];
            const val = e[name];
            return `${name} (${(val * 100).toFixed(1)}%)`;
          })
          .join(', ');

        setConversation((prev) => prev.slice(0, -1));

        for (const song of apiResponse.items) {
          const analysis = await processSingleSong(
            song,
            userInput,
            detectedEmotions,
            [],
            setConversation
          );
          if (analysis) {
            addSongCardToConversation(song);
          }
        }
      } catch (error) {
        console.error('Suggestion error', error);
        setConversation((prev) => [
          ...prev.slice(0, -1),
          {
            type: 'error',
            content: `Unexpected error occurred. Please try again.`,
          },
        ]);
      } finally {
        setLoading(false);
      }
    },
    [loading, user?.id]
  );

  const generateResponseToUser = useCallback(
    async (userInput: string = '') => {
      if (!userInput.trim()) return;
      await processSongSuggestions(userInput);
    },
    [processSongSuggestions]
  );

  const handleSongClick = (song: SongItem) => {
    if (!user) {
      alert('Please sign in to add songs to your playlist');
      return;
    }
    setShowRightPanel(true);
    if (!selectedSongs.some((s) => s.song_id === song.song_id)) {
      setSelectedSongs([...selectedSongs, song]);
    }
  };

  const handleNewPlaylist = async (song: SongItem) => {
    if (!user) {
      alert('Please sign in to add songs to your playlist');
      return;
    }

    try {
      const response = await fetch(
        'http://13.48.124.211/api/create-user-playlist',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            user_id: user.id,
            playlist_name: `My Playlist ${new Date().toLocaleDateString()}`,
            playlist_items: [{ song_id: song.song_id }],
          }),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to create playlist');
      }

      setShowRightPanel(true);
      setSelectedSongs((prev) => [...prev, song]);
    } catch (error) {
      console.error('Error creating playlist:', error);
      alert('Failed to create playlist. Please try again.');
    }
  };

  const removeSelectedSong = (songName?: string) => {
    setSelectedSongs(selectedSongs.filter((song) => song.song !== songName));
  };

  const handleSongSelect = (song: SongItem) => {
    if (!user) {
      alert('Please sign in to select songs');
      return;
    }
    setShowRightPanel(true);
    setSelectedSongs((prev) =>
      prev.some((s) => s.song === song.song && s.artist === song.artist)
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
                <div className="flex-1 p-4 overflow-y-auto w-full max-w-xl scrollbar-thin">
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
                          onNewPlaylist={handleNewPlaylist}
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
            <div className="w-1/2 flex flex-col border-r border-gray-800 items-center overflow-y-auto scrollbar-thin">
              <div className="flex-1 p-4 overflow-y-auto w-full max-w-xl ">
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
                        onNewPlaylist={handleNewPlaylist}
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
                <EmotionMeter
                  songData={getSelectedSongEmotionsList(selectedSongs)}
                />

                {selectedSongs.map((song, index) => (
                  <div
                    onClick={() => removeSelectedSong(song.song)}
                    key={index}
                    className={`${
                      index > 0 ? 'mt-4' : ''
                    } bg-black rounded-lg p-4 flex items-start w-full max-w-xl cursor-pointer`}
                  >
                    <SongCard title={song.song} artist={song.artist} />
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
