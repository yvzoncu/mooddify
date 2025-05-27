'use client';

import { useState, useCallback } from 'react';
import ChatHeader from '@/components/ChatComponents/ChatHeader';
import ChatInput from '@/components/ChatComponents/UserInput';
import {
  SongItem,
  ConversationItem,
  BreadcrumbItem,
} from '@/types/MoodifyTypes';
import ChatAIMessage from '@/components/ChatComponents/ChatAIMessage';
import ChatUserMessage from '@/components/ChatComponents/ChatUserMessage';
import ChatLoadingMesage from '@/components/ChatComponents/ChatLoadingMessage';
import ChatSong from '@/components/ChatComponents/ChatSong';
import { fetchSongSuggestions, processSingleSong } from '@/utils/songUtils';
import { useAuth } from '@/contexts/AuthContext';
import UserPlaylist from '@/components/PlaylistComponents/UserPlaylist';
import GlobalPlaylistView from '@/components/PlaylistComponents/GlobalPlaylistView';
import Breadcrumb from '@/components/PlaylistComponents/Breadcrumb';

interface PlaylistData {
  message?: string;
  playlist: {
    id: number;
    user_id: string;
    playlist_name: string;
    playlist_items: Array<{ song_id: number }>;
  };
  items: SongItem[];
}

export default function MoodPlaylistUI() {
  const { user } = useAuth();
  const [showRightPanel, setShowRightPanel] = useState(false);
  const [firstPromptSent, setFirstPromptSent] = useState(false);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [conversation, setConversation] = useState<ConversationItem[]>([]);
  const [playlistData, setPlaylistData] = useState<PlaylistData | null>(null);
  const [playlistLoading, setPlaylistLoading] = useState(false);
  const [showGlobalPlaylist, setShowGlobalPlaylist] = useState(false);
  const [breadcrumbItems, setBreadcrumbItems] = useState<BreadcrumbItem[]>([]);
  const [userPlaylists, setUserPlaylists] = useState<
    Array<{
      id: number;
      playlist_name: string;
      playlist_items: Array<{ song_id: number }>;
    }>
  >([]);

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
        console.log('Fetching suggestions for:', userInput);
        const apiResponse = await fetchSongSuggestions(
          userInput,
          user?.id || 'None'
        );
        console.log('API Response:', apiResponse);

        if (!apiResponse || !apiResponse.items?.length) {
          console.log('No suggestions found');
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

        console.log('Detected emotions:', detectedEmotions);
        setConversation((prev) => prev.slice(0, -1));

        for (const song of apiResponse.items) {
          console.log('Processing song:', song.song);
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
        console.error('Suggestion error:', error);
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

  const handleNewPlaylist = async (song: SongItem) => {
    if (!user) {
      alert('Please sign in to add songs to your playlist');
      return;
    }

    try {
      setPlaylistLoading(true);
      const now = new Date();
      const date = now.toLocaleDateString();
      const time = now.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      });
      const playlistName = `My Playlist ${date} ${time}`;

      const response = await fetch(
        'http://13.48.124.211/api/create-user-playlist',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            user_id: user.id,
            playlist_name: playlistName,
            playlist_items: [{ song_id: song.song_id }],
          }),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to create playlist');
      }
      const data = await response.json();
      setUserPlaylists(data.playlists || []);
      setPlaylistData(data.new_item);
      setBreadcrumbItems([
        {
          label: 'Playlists',
          onClick: () => {
            setPlaylistData(null);
            setBreadcrumbItems([
              {
                label: 'Playlists',
                onClick: () => {},
                isActive: true,
              },
            ]);
          },
          isActive: false,
        },
        {
          label: playlistName,
          onClick: () => {},
          isActive: true,
        },
      ]);
      setShowRightPanel(true);
    } catch (error) {
      console.error('Error creating playlist:', error);
      alert('Failed to create playlist. Please try again.');
    } finally {
      setPlaylistLoading(false);
    }
  };

  const handleSelectPlaylist = async (
    playlistId: number,
    songId: number,
    action: string = 'Add'
  ) => {
    try {
      setPlaylistLoading(true);
      const response = await fetch(
        `http://13.48.124.211/api/update-user-playlist?playlist_id=${playlistId}&song_id=${songId}&action=${action.toLowerCase()}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to update playlist');
      }

      const data = await response.json();
      setPlaylistData(data);
    } catch (error) {
      console.error('Error updating playlist:', error);
      alert('Failed to add song to playlist. Please try again.');
    } finally {
      setPlaylistLoading(false);
    }
  };

  const handlePlaylistView = async (
    playlistId: number,
    playlistName: string
  ) => {
    try {
      setPlaylistLoading(true);
      const response = await fetch(
        `http://13.48.124.211/api/get-playlist-by-playlist-id?id=${playlistId}`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch playlist');
      }

      const data = await response.json();
      setPlaylistData(data);
      setBreadcrumbItems([
        {
          label: 'Playlists',
          onClick: () => {
            setPlaylistData(null);
            setBreadcrumbItems([
              {
                label: 'Playlists',
                onClick: () => {},
                isActive: true,
              },
            ]);
          },
          isActive: false,
        },
        {
          label: playlistName,
          onClick: () => {},
          isActive: true,
        },
      ]);
    } catch (error) {
      console.error('Error fetching playlist:', error);
      alert('Failed to load playlist. Please try again.');
    } finally {
      setPlaylistLoading(false);
    }
  };

  const fetchUserPlaylists = async () => {
    if (!user) {
      alert('Please sign in to view your playlists');
      return;
    }

    try {
      setPlaylistLoading(true);
      const response = await fetch(
        `http://13.48.124.211/api/get-user-playlist?user_id=${user.id}`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch playlists');
      }

      const data = await response.json();
      setUserPlaylists(data.playlists || []);
      setPlaylistData(null);
      setBreadcrumbItems([
        {
          label: 'Playlists',
          onClick: () => {},
          isActive: true,
        },
      ]);
      setShowRightPanel(true);
    } catch (error) {
      console.error('Error fetching playlists:', error);
      alert('Failed to load playlists. Please try again.');
    } finally {
      setPlaylistLoading(false);
    }
  };

  const handleDeletePlaylist = async (playlistId: number) => {
    if (!user) {
      alert('Please sign in to delete playlists');
      return;
    }

    try {
      setPlaylistLoading(true);
      const response = await fetch(
        `http://13.48.124.211/api/delete-user-playlist?user_id=${user.id}&playlist_id=${playlistId}`,
        {
          method: 'DELETE',
        }
      );

      if (!response.ok) {
        throw new Error('Failed to delete playlist');
      }

      const data = await response.json();
      setUserPlaylists(data.playlists || []);
      // If we're viewing the deleted playlist, go back to playlist list
      if (playlistData?.playlist?.id === playlistId) {
        setPlaylistData(null);
        setBreadcrumbItems([
          {
            label: 'Playlists',
            onClick: () => {},
            isActive: true,
          },
        ]);
      }
    } catch (error) {
      console.error('Error deleting playlist:', error);
      alert('Failed to delete playlist. Please try again.');
    } finally {
      setPlaylistLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-black text-white">
      <ChatHeader />
      <div className="flex-1 bg-black text-white overflow-hidden">
        {!showRightPanel ? (
          <div className="flex flex-col items-center justify-center h-full">
            {!firstPromptSent ? (
              <div className="flex flex-col items-center justify-center h-full w-full max-w-xl">
                <p className="text-lg font-semibold mb-4">
                  Find your song based on your mood
                </p>
                <ChatInput
                  inputText={inputText}
                  setInputText={setInputText}
                  onSend={() => generateResponseToUser(inputText)}
                  onPlus={fetchUserPlaylists}
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
                        <ChatAIMessage content={msg.content} />
                      ) : msg.type === 'song' && msg.song ? (
                        <ChatSong
                          song={msg.song}
                          onNewPlaylist={handleNewPlaylist}
                          onSelectPlaylist={handleSelectPlaylist}
                        />
                      ) : msg.type === 'loading' ? (
                        <ChatLoadingMesage />
                      ) : msg.type === 'error' ? (
                        <ChatAIMessage content={msg.content} />
                      ) : null}
                    </div>
                  ))}
                </div>
                <ChatInput
                  inputText={inputText}
                  setInputText={setInputText}
                  onSend={() => generateResponseToUser(inputText)}
                  onPlus={fetchUserPlaylists}
                  loading={loading}
                  rightPanel={showRightPanel}
                />
              </div>
            )}
          </div>
        ) : (
          <div className="flex w-full h-full">
            <div className="w-1/2 flex flex-col border-r border-gray-800 items-center overflow-y-auto scrollbar-thin">
              <div className="flex-1 p-4 overflow-y-auto w-full max-w-xl">
                {conversation.map((msg, index) => (
                  <div key={index} className="mb-4">
                    {msg.type === 'user' ? (
                      <ChatUserMessage content={msg.content} />
                    ) : msg.type === 'ai' ? (
                      <ChatAIMessage content={msg.content} />
                    ) : msg.type === 'song' && msg.song ? (
                      <ChatSong
                        song={msg.song}
                        onNewPlaylist={handleNewPlaylist}
                        onSelectPlaylist={handleSelectPlaylist}
                      />
                    ) : msg.type === 'loading' ? (
                      <ChatLoadingMesage />
                    ) : msg.type === 'error' ? (
                      <ChatAIMessage content={msg.content} />
                    ) : null}
                  </div>
                ))}
              </div>
              <ChatInput
                inputText={inputText}
                setInputText={setInputText}
                onSend={() => generateResponseToUser(inputText)}
                onPlus={fetchUserPlaylists}
                loading={loading}
                rightPanel={showRightPanel}
              />
            </div>
            <div className="w-1/2 bg-gray-900 flex flex-col items-start overflow-y-auto">
              <div className="p-6 w-full">
                <Breadcrumb
                  items={breadcrumbItems}
                  onBackClick={() => setShowRightPanel(false)}
                />
                {playlistLoading ? (
                  <div className="text-center py-8">
                    <div className="text-gray-500">Loading playlists...</div>
                  </div>
                ) : breadcrumbItems.length > 1 ? (
                  <UserPlaylist
                    playlistData={playlistData}
                    isLoading={false}
                    onReemoveSongFromPlaylist={handleSelectPlaylist}
                  />
                ) : (
                  <div className="space-y-3 mt-4">
                    {userPlaylists.length === 0 ? (
                      <p className="text-gray-500 text-center py-4">
                        No playlists found
                      </p>
                    ) : (
                      userPlaylists.map((playlist) => (
                        <div
                          key={playlist.id}
                          className="flex items-center justify-between p-4 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors"
                        >
                          <div
                            className="flex-1 cursor-pointer"
                            onClick={() =>
                              handlePlaylistView(
                                playlist.id,
                                playlist.playlist_name
                              )
                            }
                          >
                            <div className="font-medium text-white">
                              {playlist.playlist_name}
                            </div>
                            <div className="text-sm text-gray-400">
                              {playlist.playlist_items.length} items
                            </div>
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (
                                window.confirm(
                                  'Are you sure you want to delete this playlist?'
                                )
                              ) {
                                handleDeletePlaylist(playlist.id);
                              }
                            }}
                            className="p-2 rounded-full hover:bg-gray-600 transition-colors text-gray-400 hover:text-white"
                            title="Delete playlist"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="20"
                              height="20"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <path d="M3 6h18" />
                              <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                              <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                            </svg>
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
      {showGlobalPlaylist && (
        <GlobalPlaylistView
          onClose={() => setShowGlobalPlaylist(false)}
          onSelectPlaylist={(playlistId) => handlePlaylistView(playlistId, '')}
        />
      )}
    </div>
  );
}
