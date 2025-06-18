import React, { useState, useEffect } from 'react';
import { PlaylistData } from '@/types/PlaylistTypes';
import SongCard from '@/components/ChatComponents/SongCard';
import {
  Delete,
  Activity,
  Music2,
  Heart,
  Volume2,
  LayoutGrid,
  List,
  GripVertical,
  Share2,
  Sparkles,
  BringToFront,
  X,
} from 'lucide-react';
import PlaylistMetrics from '@/components/ListComponents/PlaylistMetrics';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useAuth } from '@/contexts/AuthContext';
import Image from 'next/image';

interface UserPlaylistProps {
  playlistData: PlaylistData | null;
  isLoading: boolean;
  onRemoveSongFromPlaylist: (
    playlistId: number,
    song_id: number,
    action: string
  ) => void;
}

type ViewMode = 'card' | 'list';

interface PlaylistItem {
  song_id: number;
  song: string;
  artist: string;
  song_info?: string;
  energy: number;
  acousticness: number;
  valence: number;
  danceability: number;
  spotify_id?: string;
  album_image?: string;
}

interface RawPlaylistItem {
  song_id?: number;
  id?: number;
  song?: string;
  artist?: string;
  song_info?: string;
  energy?: number;
  acousticness?: number;
  valence?: number;
  danceability?: number;
  spotify_id?: string;
  album_image?: string;
}

interface SortableItemProps {
  id: string;
  children: (
    listeners: ReturnType<typeof useSortable>['listeners'],
    attributes: ReturnType<typeof useSortable>['attributes']
  ) => React.ReactNode;
}

const SortableItem = ({ id, children }: SortableItemProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: id.toString() });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 2 : 1,
    opacity: isDragging ? 0.8 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="relative">
      {children(listeners, attributes)}
    </div>
  );
};

const UserPlaylist = ({
  playlistData,
  isLoading,
  onRemoveSongFromPlaylist,
}: UserPlaylistProps) => {
  const { user } = useAuth();
  const userId = user?.id || '';
  const userName = user?.user_metadata?.full_name || '';
  const userEmail = user?.email || '';
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [items, setItems] = useState<PlaylistItem[]>([]);
  const [isSharing, setIsSharing] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [playlistAnalysis, setPlaylistAnalysis] = useState<string>('');
  const [identifier, setIdentifier] = useState<number>(0);
  const [showAnalysis, setShowAnalysis] = useState(true);
  const [localPlaylistItems, setLocalPlaylistItems] = useState<
    { song_id: number }[]
  >([]);
  const [djAnalysis, setDjAnalysis] = useState<string>('');
  const [showDjAnalysis, setShowDjAnalysis] = useState(false);
  const [isDjAnalyzing, setIsDjAnalyzing] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Initialize items and playlist analysis when playlistData changes
  useEffect(() => {
    if (playlistData?.items) {
      // Transform items to ensure all required fields are present
      const transformedItems = playlistData.items
        .map(
          (item: RawPlaylistItem): PlaylistItem => ({
            song_id: item.song_id ?? item.id ?? 0,
            song: item.song ?? '',
            artist: item.artist ?? '',
            song_info: item.song_info,
            energy: item.energy ?? 0,
            acousticness: item.acousticness ?? 0,
            valence: item.valence ?? 0,
            danceability: item.danceability ?? 0,
            spotify_id: item.spotify_id,
            album_image: item.album_image,
          })
        )
        .filter((item) => item.song_id !== 0);

      setItems(transformedItems);

      console.log('Debug - Items loaded:', {
        originalItems: playlistData.items.length,
        transformedItems: transformedItems.length,
        itemIds: transformedItems.map((item) => item.song_id),
        playlistItems: playlistData.playlist?.playlist_items?.length || 0,
        playlistItemIds:
          playlistData.playlist?.playlist_items?.map((item) => item.id) || [],
      });
    }

    // Initialize playlist analysis
    if (playlistData?.playlist.playlist_analysis) {
      setPlaylistAnalysis(playlistData.playlist.playlist_analysis);
    }

    // Initialize identifier
    if (playlistData?.playlist.identifier) {
      setIdentifier(playlistData.playlist.identifier);
    }

    // Initialize local playlist items
    if (playlistData?.playlist.playlist_items) {
      setLocalPlaylistItems(
        playlistData.playlist.playlist_items.map(
          (item: { song_id?: number; id?: number }) => ({
            song_id: item.song_id ?? item.id ?? 0,
          })
        )
      );
    }
  }, [playlistData]);

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (
      !active ||
      !over ||
      active.id === over.id ||
      !playlistData?.playlist?.id
    ) {
      return;
    }

    const oldIndex = items.findIndex(
      (item) => item.song_id.toString() === active.id
    );
    const newIndex = items.findIndex(
      (item) => item.song_id.toString() === over.id
    );

    if (oldIndex !== -1 && newIndex !== -1) {
      // Capture the song_id BEFORE updating the state
      const songIdToMove = items[oldIndex].song_id;
      const targetSongId = items[newIndex].song_id;

      // Calculate server-side indices based on current playlist_items
      const currentPlaylistItems =
        localPlaylistItems.length > 0
          ? localPlaylistItems
          : (playlistData.playlist.playlist_items || []).map(
              (item: { song_id?: number; id?: number }) => ({
                song_id: item.song_id ?? item.id ?? 0,
              })
            );
      const serverOldIndex = currentPlaylistItems.findIndex(
        (item) => item.song_id === songIdToMove
      );
      const serverNewIndex = currentPlaylistItems.findIndex(
        (item) => item.song_id === targetSongId
      );

      console.log('Debug - Drag and drop details:', {
        activeId: active.id,
        overId: over.id,
        frontendOldIndex: oldIndex,
        frontendNewIndex: newIndex,
        serverOldIndex,
        serverNewIndex,
        songIdToMove,
        targetSongId,
        playlistItems: currentPlaylistItems.map((item) => item.song_id),
        frontendItems: items.map((item) => item.song_id),
        playlistId: playlistData.playlist.id,
      });

      // Validate server indices
      if (serverOldIndex === -1 || serverNewIndex === -1) {
        console.error('Could not find song indices in playlist_items');
        alert('Error: Song not found in playlist structure');
        return;
      }

      // Update local state immediately for better UX
      const newItems = arrayMove(items, oldIndex, newIndex);
      setItems(newItems);

      // Save to database using server indices
      try {
        const requestBody = {
          playlist_id: playlistData.playlist.id,
          song_id: songIdToMove,
          old_index: serverOldIndex,
          new_index: serverNewIndex,
        };

        console.log('API Request Body:', requestBody);

        const response = await fetch(
          `http://56.228.4.188/api/reorder-playlist-items`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody),
          }
        );

        if (!response.ok) {
          throw new Error('Failed to save playlist order');
        }

        const data = await response.json();
        console.log('Playlist order saved successfully:', data.message);

        // Update the playlist data with the response from the server
        if (data.items && Array.isArray(data.items)) {
          // Transform the server response to match our local state format
          const transformedItems = data.items.map(
            (item: {
              id: number;
              song: string;
              artist: string;
              song_info?: string;
              energy?: number;
              acousticness?: number;
              valence?: number;
              danceability?: number;
              spotify_id?: string;
              album_image?: string;
            }) => ({
              song_id: item.id,
              song: item.song,
              artist: item.artist,
              song_info: item.song_info,
              energy: item.energy || 0,
              acousticness: item.acousticness || 0,
              valence: item.valence || 0,
              danceability: item.danceability || 0,
              spotify_id: item.spotify_id,
              album_image: item.album_image,
            })
          );
          setItems(transformedItems);
        }

        // Update local playlist_items to match server state
        if (data.playlist?.playlist_items) {
          setLocalPlaylistItems(
            data.playlist.playlist_items.map(
              (item: { song_id?: number; id?: number }) => ({
                song_id: item.song_id ?? item.id ?? 0,
              })
            )
          );
          console.log(
            'Local playlist_items updated:',
            data.playlist.playlist_items
          );
        }

        // Update identifier if provided
        if (data.playlist?.identifier !== undefined) {
          setIdentifier(data.playlist.identifier);
        }
      } catch (error) {
        console.error('Error saving playlist order:', error);
        // Revert the local state if API call fails
        setItems(items);
        alert('Failed to save playlist order. Please try again.');
      }
    }
  };

  const handleShare = async () => {
    setIsSharing(true);
    try {
      let name = userName && userName.trim() ? userName : '';
      if (!name && userEmail) {
        name = userEmail.split('@')[0];
      }
      const response = await fetch('http://56.228.4.188/api/share-playlist', {
        method: 'POST',
        headers: {
          accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          playlist_id: playlistData?.playlist.id,
          user_id: userId,
          user_name: name,
          owner_notes: playlistAnalysis,
        }),
      });
      if (!response.ok) throw new Error('Failed to get share link');
      const data = await response.json();
      const url = data.share_url || data.url || data.link || '';
      if (!url) throw new Error('No share URL returned');

      // Try to use the Web Share API first
      if (navigator.share) {
        try {
          await navigator.share({
            title: playlistData?.playlist.playlist_name || 'Shared Playlist',
            text: 'Check out this playlist!',
            url: url,
          });
          return; // Exit if Web Share API succeeded
        } catch {
          // If user cancelled or share failed, fall through to clipboard
          console.log('Web Share API failed, falling back to clipboard');
        }
      }

      // Try to use the Clipboard API
      if (navigator.clipboard && window.isSecureContext) {
        try {
          await navigator.clipboard.writeText(url);
          alert('Share link copied to clipboard!');
          return; // Exit if clipboard write succeeded
        } catch {
          console.log('Clipboard API failed, falling back to fallback method');
        }
      }

      // Fallback method: Create a temporary input element
      const tempInput = document.createElement('input');
      tempInput.style.position = 'absolute';
      tempInput.style.left = '-9999px';
      tempInput.value = url;
      document.body.appendChild(tempInput);
      tempInput.select();
      try {
        document.execCommand('copy');
        alert('Share link copied to clipboard!');
      } catch {
        alert('Unable to copy automatically. Your share link is: ' + url);
      } finally {
        document.body.removeChild(tempInput);
      }
    } catch (err: unknown) {
      let message = 'Unknown error';
      if (err instanceof Error) message = err.message;
      else if (typeof err === 'string') message = err;
      alert('Failed to share playlist: ' + message);
    } finally {
      setIsSharing(false);
    }
  };

  const handleAIAnalysis = async () => {
    if (!playlistData?.playlist.id) return;

    if (identifier === items.length) {
      setShowAnalysis(!showAnalysis);
      return;
    }

    setIsAnalyzing(true);
    try {
      const response = await fetch(
        `http://56.228.4.188/api/playlist-analysis?playlist_id=${playlistData.playlist.id}`,
        {
          method: 'GET',
          headers: {
            accept: 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to get playlist analysis: ${response.status}`);
      }

      const data = await response.json();

      if (data.analysis) {
        setPlaylistAnalysis(data.analysis);
      } else {
        throw new Error('No analysis data received');
      }
      if (data.identifier) {
        setIdentifier(data.identifier);
      } else {
        throw new Error('No identifier data received');
      }
    } catch (error) {
      console.error('Error fetching playlist analysis:', error);
      alert('Failed to get AI analysis. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleAIOrderSuggestion = async () => {
    if (djAnalysis) {
      setShowDjAnalysis(!showDjAnalysis);
      return;
    }

    setShowDjAnalysis(false);
    setIsDjAnalyzing(true);

    try {
      const response = await fetch(
        `http://56.228.4.188/api/dj-playlist-order?playlist_id=${playlistData?.playlist.id}`,
        {
          method: 'GET',
          headers: {
            accept: 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error(
          `Failed to get DJ order suggestion: ${response.status}`
        );
      }

      const data = await response.json();

      if (data.dj_analysis) {
        setDjAnalysis(data.dj_analysis);
        setShowDjAnalysis(true);
      } else {
        throw new Error('No DJ analysis data received');
      }
    } catch (error) {
      console.error('Error fetching DJ order suggestion:', error);
      alert('Failed to get DJ order suggestion. Please try again.');
    } finally {
      setIsDjAnalyzing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="text-gray-500 text-center p-4">Loading playlist...</div>
    );
  }

  if (!playlistData) {
    return (
      <div className="text-gray-500 text-center p-4">
        No playlist data available
      </div>
    );
  }

  if (
    !playlistData.playlist.playlist_items ||
    playlistData.playlist.playlist_items.length === 0
  ) {
    return (
      <div className="text-gray-500 text-center p-4">
        This playlist is empty. Add some songs to get started!
      </div>
    );
  }

  const renderListView = (
    song: PlaylistItem,
    listeners: ReturnType<typeof useSortable>['listeners'],
    attributes: ReturnType<typeof useSortable>['attributes']
  ) => (
    <div className="relative w-full max-w-xl p-3 bg-black rounded-lg shadow-md flex items-center justify-between">
      <button
        className="absolute left-2 top-1/2 -translate-y-1/2 p-1.5 rounded-md hover:bg-gray-800 cursor-grab active:cursor-grabbing"
        {...listeners}
        {...attributes}
      >
        <GripVertical size={14} className="text-gray-400" />
      </button>
      <div className="flex items-center gap-4 flex-1 pl-8">
        <div className="w-10 h-10 relative rounded-md overflow-hidden flex-shrink-0">
          <Image
            src={song.album_image || '/images/default-album.png'}
            alt={`${song.song} album art`}
            fill
            className="object-cover"
            sizes="40px"
          />
        </div>
        <div>
          <p className="text-gray-200 font-medium">{song.song}</p>
          <p className="text-gray-400 text-sm">{song.artist}</p>
        </div>
      </div>

      {/* Musical Features */}
      <div className="flex gap-4 text-xs text-gray-300 mr-4">
        <div className="flex items-center gap-1" title="Energy">
          <Activity size={14} className="text-yellow-400" />
          <span>{Math.round(song.energy * 100)}%</span>
        </div>
        <div className="flex items-center gap-1" title="Acousticness">
          <Music2 size={14} className="text-blue-400" />
          <span>{Math.round(song.acousticness * 100)}%</span>
        </div>
        <div className="flex items-center gap-1" title="Valence">
          <Heart size={14} className="text-red-400" />
          <span>{Math.round(song.valence * 100)}%</span>
        </div>
        <div className="flex items-center gap-1" title="Danceability">
          <Volume2 size={14} className="text-green-400" />
          <span>{Math.round(song.danceability * 100)}%</span>
        </div>
      </div>

      {/* Action Button */}
      <button
        onClick={() =>
          onRemoveSongFromPlaylist(
            playlistData.playlist.id,
            song.song_id,
            'Remove'
          )
        }
        title="Remove from Playlist"
        className="p-2 rounded-full hover:bg-gray-700 transition-colors text-gray-400 hover:text-red-400"
      >
        <Delete size={18} />
      </button>
    </div>
  );

  const renderCardView = (
    song: PlaylistItem,
    listeners: ReturnType<typeof useSortable>['listeners'],
    attributes: ReturnType<typeof useSortable>['attributes']
  ) => (
    <div className="relative w-full max-w-xl p-4 pb-16 bg-black rounded-lg shadow-md">
      <button
        className="absolute left-2 top-4 p-1.5 rounded-md hover:bg-gray-800 cursor-grab active:cursor-grabbing"
        {...listeners}
        {...attributes}
      >
        <GripVertical size={14} className="text-gray-400" />
      </button>
      {/* Song Info */}
      <div className="mb-4 text-sm text-gray-300 pl-8">
        <p>{song.song_info || `${song.song} by ${song.artist}`}</p>
      </div>

      <div className="pl-8">
        <SongCard
          id={song.song_id}
          song={song.song}
          artist={song.artist}
          spotify_id={song.spotify_id}
          album_image={song.album_image}
        />
      </div>

      {/* Musical Features and Buttons */}
      <div className="absolute bottom-2 left-10 right-2 flex justify-between items-center">
        {/* Musical Features */}
        <div className="flex gap-4 text-xs text-gray-300">
          <div
            className="flex items-center gap-1 group relative cursor-help"
            aria-label="Energy"
          >
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
              Energy Level
            </div>
            <Activity size={16} className="text-yellow-400" />
            <span>{Math.round(song.energy * 100)}%</span>
          </div>
          <div
            className="flex items-center gap-1 group relative cursor-help"
            aria-label="Acousticness"
          >
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
              Acoustic Elements
            </div>
            <Music2 size={16} className="text-blue-400" />
            <span>{Math.round(song.acousticness * 100)}%</span>
          </div>
          <div
            className="flex items-center gap-1 group relative cursor-help"
            aria-label="Valence"
          >
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
              Musical Positivity
            </div>
            <Heart size={16} className="text-red-400" />
            <span>{Math.round(song.valence * 100)}%</span>
          </div>
          <div
            className="flex items-center gap-1 group relative cursor-help"
            aria-label="Danceability"
          >
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
              Dance Rhythm
            </div>
            <Volume2 size={16} className="text-green-400" />
            <span>{Math.round(song.danceability * 100)}%</span>
          </div>
        </div>

        {/* Action Button */}
        <div className="flex gap-2">
          <button
            onClick={() =>
              onRemoveSongFromPlaylist(
                playlistData.playlist.id,
                song.song_id,
                'Remove'
              )
            }
            title="Remove from Playlist"
            className="p-2 rounded-full hover:bg-gray-700 transition-colors text-gray-400 hover:text-red-400"
          >
            <Delete size={20} />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div>
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <PlaylistMetrics songs={items} />
        </div>
        <div className="max-w-xl w-full pr-4">
          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-300 pl-4">{items.length} songs</p>
            <div className="flex gap-2">
              {/* add a button for getting playlist order suggestions from ai */}
              <button
                onClick={handleAIOrderSuggestion}
                className={`p-2 rounded-lg transition-colors group ${
                  identifier === items.length && showDjAnalysis
                    ? 'bg-gray-700'
                    : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                }`}
                title="Get DJ order suggestion"
              >
                <BringToFront
                  size={14}
                  className="transform transition-all duration-300 ease-in-out group-hover:scale-110 group-active:scale-90 group-hover:rotate-6 relative z-10"
                />
              </button>
              <button
                onClick={handleAIAnalysis}
                className={`p-2 rounded-lg transition-colors group ${
                  identifier === items.length && showAnalysis
                    ? 'bg-gray-700'
                    : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                }`}
                title="AI Analysis"
                style={{ pointerEvents: isAnalyzing ? 'none' : 'auto' }}
              >
                {identifier === items.length ? (
                  <Sparkles
                    size={14}
                    className="transform transition-all duration-300 ease-in-out group-hover:scale-110 group-active:scale-90 group-hover:rotate-6 relative z-10"
                  />
                ) : (
                  <div className="relative">
                    {/* Outer ring animation */}
                    <span className="absolute inset-0 rounded-full border-2 border-purple-500 animate-[ping_1.5s_ease-in-out_infinite]"></span>
                    {/* Inner glow effect */}
                    <span className="absolute inset-0 rounded-full bg-purple-500/20 animate-pulse"></span>

                    <Sparkles
                      size={14}
                      className="transform transition-all duration-300 ease-in-out group-hover:scale-110 group-active:scale-90 group-hover:rotate-6 animate-float hover:animate-none relative z-10"
                    />
                  </div>
                )}
              </button>
              <button
                onClick={handleShare}
                className={`p-2 rounded-lg transition-colors ${
                  isSharing
                    ? 'bg-gray-700 text-white'
                    : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                }`}
                title="Share Playlist"
                disabled={isSharing}
              >
                <Share2 size={14} />
              </button>
              <button
                onClick={() => setViewMode('card')}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === 'card'
                    ? 'bg-gray-700 text-white'
                    : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                }`}
                title="Card View"
              >
                <LayoutGrid size={14} />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === 'list'
                    ? 'bg-gray-700 text-white'
                    : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                }`}
                title="List View"
              >
                <List size={14} />
              </button>
            </div>
          </div>
        </div>
        {isAnalyzing && (
          <div className="mt-2 px-4 py-2 bg-gray-800 text-gray-200 rounded text-sm max-w-xl w-full flex items-center gap-2">
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-purple-500 border-t-transparent"></div>
            <span>Generating AI analysis...</span>
          </div>
        )}
        {isDjAnalyzing && (
          <div className="mt-2 px-4 py-2 bg-gray-800 text-gray-200 rounded text-sm max-w-xl w-full flex items-center gap-2">
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-500 border-t-transparent"></div>
            <span>Getting DJ order suggestion...</span>
          </div>
        )}
        {playlistAnalysis && !isAnalyzing && showAnalysis && (
          <div className="mt-2 px-4 py-2 bg-gray-800 text-gray-200 rounded text-sm max-w-xl w-full relative">
            {identifier !== items.length && (
              <div className="absolute inset-0 bg-black/50 backdrop-blur-sm rounded flex items-center justify-center z-10">
                <div className="text-center">
                  <p className="text-yellow-400 font-medium">
                    Playlist changed
                  </p>
                  <p className="text-gray-300 text-xs">Update analysis</p>
                </div>
              </div>
            )}
            <div className={identifier !== items.length ? 'blur-sm' : ''}>
              {playlistAnalysis}
            </div>
          </div>
        )}
        {djAnalysis && !isDjAnalyzing && showDjAnalysis && (
          <div className="mt-2 px-4 py-2 bg-gray-900 text-gray-200 rounded text-sm max-w-xl w-full relative border border-blue-500/30">
            <div className="flex items-center justify-between mb-2">
              <span className="text-blue-400 text-xs font-medium">
                DJ Order Suggestion
              </span>
              <button
                onClick={() => setShowDjAnalysis(false)}
                className="text-gray-400 hover:text-gray-200"
              >
                <X size={14} />
              </button>
            </div>
            <div className="text-gray-200">{djAnalysis}</div>
          </div>
        )}
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={items.map((item) => item.song_id.toString())}
            strategy={verticalListSortingStrategy}
          >
            <div className={`space-y-${viewMode === 'card' ? '4' : '2'}`}>
              {items.map((song) => (
                <SortableItem key={song.song_id} id={song.song_id.toString()}>
                  {(listeners, attributes) =>
                    viewMode === 'card'
                      ? renderCardView(song, listeners, attributes)
                      : renderListView(song, listeners, attributes)
                  }
                </SortableItem>
              ))}
            </div>
          </SortableContext>
        </DndContext>
      </div>
    </div>
  );
};

export default UserPlaylist;
