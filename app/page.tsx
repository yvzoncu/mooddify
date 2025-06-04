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
import { fetchSongSuggestions, processAllSongs } from '@/utils/songUtils';
import { useAuth } from '@/contexts/AuthContext';
import UserPlaylist from '@/components/PlaylistComponents/UserPlaylist';
import GlobalPlaylistView from '@/components/PlaylistComponents/GlobalPlaylistView';
import Breadcrumb from '@/components/PlaylistComponents/Breadcrumb';
import PlaylistCard from '@/components/PlaylistComponents/PlaylistCard';
import { PlaylistItem } from '@/types/PlaylistTypes';

interface PlaylistData {
  message?: string;
  playlist: {
    id: number;
    user_id: string;
    playlist_name: string;
    playlist_items: PlaylistItem[];
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
      playlist_items: PlaylistItem[];
    }>
  >([]);

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

        // First process the AI analysis
        await processAllSongs(
          apiResponse.items,
          userInput,
          detectedEmotions,
          setConversation
        );

        // Then add each song to the conversation
        apiResponse.items.forEach((song) => {
          setConversation((prev) => [
            ...prev,
            {
              type: 'song',
              song: song,
              content: `${song.song} by ${song.artist}`,
            },
          ]);
        });
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
        'http://56.228.4.188/api/create-user-playlist',
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
        `http://56.228.4.188/api/update-user-playlist?playlist_id=${playlistId}&song_id=${songId}&action=${action.toLowerCase()}`,
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

      if (data.message === 'Song already exists in playlist') {
        alert('This song is already in the playlist!');
        return;
      }

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
      console.log('Loading playlist:', { playlistId, playlistName });
      setPlaylistLoading(true);
      const response = await fetch(
        `http://56.228.4.188/api/get-playlist-by-playlist-id?id=${playlistId}`
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Failed to fetch playlist:', {
          status: response.status,
          statusText: response.statusText,
          body: errorText,
        });
        throw new Error('Failed to fetch playlist');
      }

      const data = await response.json();
      console.log('Playlist data received:', data);

      // Initialize empty items array if not present
      if (!data.items) {
        data.items = [];
      }

      // Ensure items is always an array
      if (!Array.isArray(data.items)) {
        console.error('Invalid playlist data format:', data);
        data.items = [];
      }

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
      // Reset to playlist list view on error
      setPlaylistData(null);
      setBreadcrumbItems([
        {
          label: 'Playlists',
          onClick: () => {},
          isActive: true,
        },
      ]);
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
        `http://56.228.4.188/api/get-user-playlist?user_id=${user.id}`
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
        `http://56.228.4.188/api/delete-user-playlist?user_id=${user.id}&playlist_id=${playlistId}`,
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
            <div className="w-1/2 flex flex-col border-r border-gray-800">
              <div className="flex-1 p-4 overflow-y-auto flex flex-col items-center [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-black [&::-webkit-scrollbar-thumb]:bg-gray-600 [&::-webkit-scrollbar-thumb]:rounded-full">
                <div className="w-full max-w-xl">
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
              </div>
              <div className="flex justify-center w-full">
                <ChatInput
                  inputText={inputText}
                  setInputText={setInputText}
                  onSend={() => generateResponseToUser(inputText)}
                  onPlus={fetchUserPlaylists}
                  loading={loading}
                  rightPanel={showRightPanel}
                />
              </div>
            </div>
            <div className="w-1/2 bg-gray-900 flex flex-col">
              <div className="p-6 w-full h-full flex flex-col">
                <div className="flex-none">
                  <Breadcrumb
                    items={breadcrumbItems}
                    onBackClick={() => setShowRightPanel(false)}
                  />
                </div>
                <div className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-gray-900 [&::-webkit-scrollbar-thumb]:bg-gray-600 [&::-webkit-scrollbar-thumb]:rounded-full">
                  {playlistLoading ? (
                    <div className="flex items-center justify-center h-32">
                      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500"></div>
                    </div>
                  ) : playlistData ? (
                    <UserPlaylist
                      playlistData={playlistData}
                      isLoading={false}
                      onRemoveSongFromPlaylist={handleSelectPlaylist}
                    />
                  ) : (
                    <div className="space-y-4 mt-4">
                      {userPlaylists.length === 0 ? (
                        <p className="text-gray-500 text-center py-4">
                          No playlists found
                        </p>
                      ) : (
                        userPlaylists.map((playlist) => (
                          <PlaylistCard
                            key={playlist.id}
                            playlist={{
                              playlist: {
                                ...playlist,
                                user_id: user?.id || '',
                              },
                              items: playlist.playlist_items.map((item) => {
                                // Find the full song details from the items array
                                const songDetails = (
                                  playlistData as PlaylistData | null
                                )?.items.find(
                                  (song: SongItem) =>
                                    song.song_id === item.song_id
                                );

                                if (!songDetails) {
                                  // If we can't find the song details, create a minimal song item
                                  return {
                                    song_id: item.song_id,
                                    song: '',
                                    artist: '',
                                    genre: '',
                                    tempo: 0,
                                    danceability: 0,
                                    energy: 0,
                                    valence: 0,
                                    acousticness: 0,
                                    song_info: '',
                                    dominants: [],
                                    tags: [],
                                  };
                                }

                                return songDetails;
                              }),
                            }}
                            onSelect={handlePlaylistView}
                            onDelete={handleDeletePlaylist}
                          />
                        ))
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      {showGlobalPlaylist && (
        <GlobalPlaylistView
          onClose={() => setShowGlobalPlaylist(false)}
          onSelectPlaylist={(playlistId) => {
            const playlist = userPlaylists.find((p) => p.id === playlistId);
            if (playlist) {
              handlePlaylistView(playlistId, playlist.playlist_name);
            }
          }}
          onCreateNewPlaylist={() => {
            // Implement create new playlist functionality
            const playlistName = prompt('Enter playlist name:');
            if (playlistName && user) {
              fetch('http://56.228.4.188/api/create-user-playlist', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  user_id: user.id,
                  playlist_name: playlistName,
                  playlist_items: [],
                }),
              })
                .then((response) => response.json())
                .then((data) => {
                  setUserPlaylists(data.playlists || []);
                  if (data.new_item) {
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
                  }
                })
                .catch((error) => {
                  console.error('Error creating playlist:', error);
                  alert('Failed to create playlist. Please try again.');
                });
            }
          }}
          onDeletePlaylist={handleDeletePlaylist}
        />
      )}
    </div>
  );
}
