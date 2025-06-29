'use client';

import { useState, useCallback, useEffect } from 'react';
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
import { fetchSongSuggestions } from '@/utils/songUtils';
import { useAuth } from '@/contexts/AuthContext';
import UserPlaylist from '@/components/PlaylistComponents/UserPlaylist';
import GlobalPlaylistView from '@/components/PlaylistComponents/GlobalPlaylistView';
import Breadcrumb from '@/components/PlaylistComponents/Breadcrumb';
import PlaylistCard from '@/components/PlaylistComponents/PlaylistCard';
import { PlaylistItem } from '@/types/PlaylistTypes';
import {
  getTempPlaylist,
  setTempPlaylist,
  clearTempPlaylist,
} from '@/utils/tempPlaylist';
import { useRouter } from 'next/navigation';

interface PlaylistData {
  message?: string;
  playlist: {
    id: number;
    user_id: string;
    playlist_name: string;
    playlist_items: PlaylistItem[];
    identifier: number;
    playlist_analysis: string;
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
  const [tempPlaylist, setTempPlaylistState] = useState<SongItem[]>([]);
  const [allSuggestedSongs, setAllSuggestedSongs] = useState<SongItem[]>([]);
  const [shownSongCount, setShownSongCount] = useState(0);
  const router = useRouter();

  // Load temp playlist on mount
  useEffect(() => {
    setTempPlaylistState(getTempPlaylist());
  }, []);

  // Function to auto-display temp playlist
  const handleDisplayTempPlaylist = useCallback(() => {
    if (tempPlaylist.length === 0) return;

    setShowRightPanel(true);
    setBreadcrumbItems([
      { label: 'Temporary Playlist', onClick: () => {}, isActive: true },
    ]);

    setPlaylistData({
      playlist: {
        id: 0,
        user_id: 'temp',
        playlist_name: 'Temporary Playlist',
        playlist_items: tempPlaylist.map((song) => ({
          id: song.song_id,
          song: song.song,
          artist: song.artist,
          genre: song.genre || '',
          tempo: song.tempo || 0,
          danceability: song.danceability || 0,
          energy: song.energy || 0,
          valence: song.valence || 0,
          acousticness: song.acousticness || 0,
          release_year: null,
        })),
        identifier: 0,
        playlist_analysis: '',
      },
      items: tempPlaylist,
    });

    // Clean up URL parameter
    router.replace('/', { scroll: false });
  }, [tempPlaylist, router]);

  // Function to auto-display user playlist
  const handleAutoDisplayPlaylist = useCallback(
    async (playlistId: number) => {
      try {
        console.log('Auto-displaying playlist:', playlistId);
        setPlaylistLoading(true);

        // Fetch the playlist directly
        const response = await fetch(
          `http://56.228.4.188/api/get-playlist-by-playlist-id?id=${playlistId}`
        );

        if (!response.ok) {
          throw new Error('Failed to fetch playlist');
        }

        const data = await response.json();
        console.log('Auto-display playlist data:', data);

        // Initialize empty items array if not present
        if (!data.items) {
          data.items = [];
        }

        // Ensure items is always an array
        if (!Array.isArray(data.items)) {
          data.items = [];
        }

        // Set the playlist data and show sidebar
        setPlaylistData(data);
        setShowRightPanel(true);
        setBreadcrumbItems([
          {
            label: 'Playlists',
            onClick: () => {
              setPlaylistData(null);
              setShowRightPanel(false);
            },
            isActive: false,
          },
          {
            label: data.playlist?.playlist_name || 'Playlist',
            onClick: () => {},
            isActive: true,
          },
        ]);

        console.log('Auto-display completed successfully');

        // Clean up URL parameter
        router.replace('/', { scroll: false });
      } catch (error) {
        console.error('Error auto-displaying playlist:', error);
        // Clean up URL parameter even on error
        router.replace('/', { scroll: false });
      } finally {
        setPlaylistLoading(false);
      }
    },
    [
      router,
      setPlaylistData,
      setShowRightPanel,
      setBreadcrumbItems,
      setPlaylistLoading,
    ]
  );

  // Handle URL parameters to auto-display playlists
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const urlParams = new URLSearchParams(window.location.search);
    const showTempPlaylist = urlParams.get('showTempPlaylist');
    const showPlaylistId = urlParams.get('showPlaylist');

    console.log('URL parameter check:', {
      showTempPlaylist,
      showPlaylistId,
      tempPlaylistLength: tempPlaylist.length,
      userExists: !!user,
    });

    if (showTempPlaylist === 'true' && tempPlaylist.length > 0) {
      // Auto-display temp playlist
      console.log('Auto-displaying temp playlist');
      handleDisplayTempPlaylist();
    } else if (showPlaylistId && user) {
      // Auto-display user playlist
      const playlistId = parseInt(showPlaylistId);
      console.log('Auto-displaying user playlist:', playlistId);
      if (!isNaN(playlistId)) {
        // Fetch and display the specific playlist
        handleAutoDisplayPlaylist(playlistId);
      }
    }
  }, [
    tempPlaylist,
    user,
    handleDisplayTempPlaylist,
    handleAutoDisplayPlaylist,
  ]);

  // When user logs in, check for temp playlist
  useEffect(() => {
    if (user && tempPlaylist.length > 0) {
      if (
        window.confirm(
          'You have a temporary playlist. Save it to your account?'
        )
      ) {
        // TODO: Call backend API to save playlist for user
        // Example: await savePlaylistToBackend(user.id, tempPlaylist);
        clearTempPlaylist();
        setTempPlaylistState([]);
      }
    }
  }, [user, tempPlaylist.length]);

  // Modified add song handler for temp playlist
  const handleAddSongToTemp = (song: SongItem) => {
    if (tempPlaylist.some((s) => s.song_id === song.song_id)) return; // Prevent duplicate
    const updated = [...tempPlaylist, song];
    setTempPlaylist(updated);
    setTempPlaylistState(updated);
    // Show sidebar and set breadcrumb for temp playlist
    setShowRightPanel(true);
    setBreadcrumbItems([
      {
        label: 'Playlists',
        onClick: () => setShowRightPanel(false),
        isActive: false,
      },
      { label: 'Temporary Playlist', onClick: () => {}, isActive: true },
    ]);
    // Set playlistData to a mock object for UserPlaylist
    setPlaylistData({
      playlist: {
        id: 0,
        user_id: 'temp',
        playlist_name: 'Temporary Playlist',
        playlist_items: updated.map((song) => ({
          id: song.song_id,
          song: song.song,
          artist: song.artist,
          genre: song.genre || '',
          tempo: song.tempo || 0,
          danceability: song.danceability || 0,
          energy: song.energy || 0,
          valence: song.valence || 0,
          acousticness: song.acousticness || 0,
          release_year: null,
        })),
        identifier: 0,
        playlist_analysis: '',
      },
      items: updated,
    });
  };

  // Handle removing a song from temp playlist
  const handleRemoveSongFromTempPlaylist = (
    playlistId: number,
    songId: number,
    action: string
  ) => {
    if (playlistId === 0) {
      const updated = tempPlaylist.filter((song) => song.song_id !== songId);
      setTempPlaylist(updated);
      setTempPlaylistState(updated);
      setPlaylistData((prev) =>
        prev
          ? {
              ...prev,
              playlist: {
                ...prev.playlist,
                playlist_items: prev.playlist.playlist_items.filter(
                  (item: PlaylistItem) => item.id !== songId
                ),
              },
              items: updated,
            }
          : prev
      );
    } else {
      handleSelectPlaylist(playlistId, songId, action);
    }
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
        setConversation((prev) => prev.slice(0, -1));
        setAllSuggestedSongs(apiResponse.items);
        setShownSongCount(0);
        // Add first 3 songs
        const firstBatch = apiResponse.items.slice(0, 3);
        for (const song of firstBatch) {
          setConversation((prev) => [
            ...prev,
            {
              type: 'song',
              song: song,
              content: `${song.song} by ${song.artist}`,
            },
          ]);
          await new Promise((resolve) => setTimeout(resolve, 500));
        }
        setShownSongCount(firstBatch.length);
        if (apiResponse.items.length > 3) {
          setConversation((prev) => [
            ...prev,
            {
              type: 'action',
              content: 'Load More Songs',
              action: 'load-more',
            },
          ]);
        }
      } catch {
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

  const handleLoadMoreSongs = async () => {
    // Remove the action item
    setConversation((prev) => prev.filter((item) => item.type !== 'action'));
    const nextBatch = allSuggestedSongs.slice(
      shownSongCount,
      shownSongCount + 3
    );
    for (const song of nextBatch) {
      setConversation((prev) => [
        ...prev,
        {
          type: 'song',
          song: song,
          content: `${song.song} by ${song.artist}`,
        },
      ]);
      await new Promise((resolve) => setTimeout(resolve, 500));
    }
    const newShownCount = shownSongCount + nextBatch.length;
    setShownSongCount(newShownCount);
    if (newShownCount < allSuggestedSongs.length) {
      setConversation((prev) => [
        ...prev,
        {
          type: 'action',
          content: 'Load More Songs',
          action: 'load-more',
        },
      ]);
    }
  };

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
          onClick: async () => {
            await fetchUserPlaylists();
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
      if (action.toLowerCase() === 'add') {
        setShowRightPanel(true);
        const playlist = userPlaylists.find((p) => p.id === playlistId);
        if (playlist) {
          setBreadcrumbItems([
            {
              label: 'Playlists',
              onClick: async () => {
                await fetchUserPlaylists();
              },
              isActive: false,
            },
            {
              label: playlist.playlist_name,
              onClick: () => {},
              isActive: true,
            },
          ]);
        }
      }
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
      console.log(
        'Playlist items with album images:',
        data.items?.filter((item: { album_image?: string }) => item.album_image)
      );

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
          onClick: async () => {
            await fetchUserPlaylists();
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
      await fetchUserPlaylists();
    } finally {
      setPlaylistLoading(false);
    }
  };

  const fetchUserPlaylists = async () => {
    if (!user) {
      // Show temp playlist in sidebar for anonymous users
      setShowRightPanel(true);
      setBreadcrumbItems([
        { label: 'Temporary Playlist', onClick: () => {}, isActive: true },
      ]);
      setPlaylistData({
        playlist: {
          id: 0,
          user_id: 'temp',
          playlist_name: 'Temporary Playlist',
          playlist_items: tempPlaylist.map((song) => ({
            id: song.song_id,
            song: song.song,
            artist: song.artist,
            genre: song.genre || '',
            tempo: song.tempo || 0,
            danceability: song.danceability || 0,
            energy: song.energy || 0,
            valence: song.valence || 0,
            acousticness: song.acousticness || 0,
            release_year: null,
          })),
          identifier: 0,
          playlist_analysis: '',
        },
        items: tempPlaylist,
      });
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
          onClick: async () => {
            await fetchUserPlaylists();
          },
          isActive: false,
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
            onClick: async () => {
              await fetchUserPlaylists();
            },
            isActive: false,
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
                {!user && tempPlaylist.length > 0 && (
                  <button
                    className="mt-4 px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded text-white font-semibold"
                    onClick={() => router.push('/login')}
                  >
                    Login to save playlist
                  </button>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full">
                <div className="flex-1 p-4 overflow-y-auto w-full max-w-xl  [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-black [&::-webkit-scrollbar-thumb]:bg-gray-600 [&::-webkit-scrollbar-thumb]:rounded-full">
                  {conversation.map((msg, index) => (
                    <div key={index} className="mb-4">
                      {msg.type === 'user' ? (
                        <ChatUserMessage content={msg.content} />
                      ) : msg.type === 'ai' ? (
                        <ChatAIMessage content={msg.content} />
                      ) : msg.type === 'song' && msg.song ? (
                        <ChatSong
                          song={msg.song}
                          onNewPlaylist={
                            user ? handleNewPlaylist : handleAddSongToTemp
                          }
                          onSelectPlaylist={handleSelectPlaylist}
                        />
                      ) : msg.type === 'loading' ? (
                        <ChatLoadingMesage />
                      ) : msg.type === 'error' ? (
                        <ChatAIMessage content={msg.content} />
                      ) : msg.type === 'action' &&
                        msg.action === 'load-more' ? (
                        <button
                          onClick={handleLoadMoreSongs}
                          className="w-full py-2 px-4 bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors mt-4 flex items-center justify-center gap-2"
                        >
                          <span>Load More</span>
                          <span className="text-sm text-gray-400">
                            ({shownSongCount} of {allSuggestedSongs.length})
                          </span>
                        </button>
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
                          onNewPlaylist={
                            user ? handleNewPlaylist : handleAddSongToTemp
                          }
                          onSelectPlaylist={handleSelectPlaylist}
                        />
                      ) : msg.type === 'loading' ? (
                        <ChatLoadingMesage />
                      ) : msg.type === 'error' ? (
                        <ChatAIMessage content={msg.content} />
                      ) : msg.type === 'action' &&
                        msg.action === 'load-more' ? (
                        <button
                          onClick={handleLoadMoreSongs}
                          className="w-full py-2 px-4 bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors mt-4 flex items-center justify-center gap-2"
                        >
                          <span>Load More</span>
                          <span className="text-sm text-gray-400">
                            ({shownSongCount} of {allSuggestedSongs.length})
                          </span>
                        </button>
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
                      onRemoveSongFromPlaylist={
                        handleRemoveSongFromTempPlaylist
                      }
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
                                identifier: 0,
                                playlist_analysis: '',
                              },
                              items: playlist.playlist_items.map((item) => ({
                                song_id: item.id,
                                song: item.song,
                                artist: item.artist,
                                genre: item.genre,
                                tempo: item.tempo,
                                danceability: item.danceability,
                                energy: item.energy,
                                valence: item.valence,
                                acousticness: item.acousticness,
                                song_info: '',
                                dominants: [],
                                tags: [],
                                spotify_id: item.spotify_id,
                                album_image: item.album_image,
                              })),
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
                              onClick: () => {
                                setPlaylistData(null);
                                setShowRightPanel(false);
                              },
                              isActive: false,
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
