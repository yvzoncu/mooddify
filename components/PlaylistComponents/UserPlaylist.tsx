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

interface SongDetails {
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
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [items, setItems] = useState<SongDetails[]>([]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Initialize items when playlistData changes
  useEffect(() => {
    if (playlistData?.items) {
      setItems(playlistData.items);
    }
  }, [playlistData]);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = items.findIndex(
        (item) => item.song_id.toString() === active.id
      );
      const newIndex = items.findIndex(
        (item) => item.song_id.toString() === over.id
      );

      // Log the reorder request (replace with API call later)
      console.log('Reorder request:', {
        playlistId: playlistData?.playlist.id,
        oldIndex,
        newIndex,
        songId: active.id,
      });

      setItems((items) => arrayMove(items, oldIndex, newIndex));
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
    song: SongDetails,
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
        <span className="text-gray-500 w-8 text-center">
          {items.findIndex((item) => item.song_id === song.song_id) + 1}
        </span>
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
    song: SongDetails,
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
          <PlaylistMetrics
            songs={items}
            title={playlistData.playlist.playlist_name}
          />
        </div>
        <div className="max-w-xl w-full pr-4">
          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-300 pl-4">{items.length} songs</p>
            <div className="flex gap-2">
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
