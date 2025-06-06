import React, { useState, useEffect } from 'react';
import {
  Music,
  Activity,
  Music2,
  Heart,
  Volume2,
  Trash2,
  ChevronDown,
} from 'lucide-react';
import { PlaylistData } from '@/types/PlaylistTypes';
import Image from 'next/image';

interface SongMetrics {
  energy: number;
  acousticness: number;
  valence: number;
  danceability: number;
  spotify_id?: string;
  album_image?: string;
}

interface PlaylistCardProps {
  playlist: PlaylistData;
  onSelect: (playlistId: number, playlistName: string) => void;
  onDelete?: (playlistId: number) => void;
}

const PlaylistCard: React.FC<PlaylistCardProps> = ({
  playlist,
  onSelect,
  onDelete,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    console.log('PlaylistCard items:', playlist.items);
    console.log(
      'Items with album images:',
      playlist.items.filter((song) => song.album_image)
    );
  }, [playlist]);

  const calculateAverageMetrics = (
    songs: SongMetrics[]
  ): SongMetrics | null => {
    if (!songs.length) return null;

    const totals = songs.reduce(
      (acc, song) => ({
        energy: acc.energy + song.energy,
        acousticness: acc.acousticness + song.acousticness,
        valence: acc.valence + song.valence,
        danceability: acc.danceability + song.danceability,
      }),
      { energy: 0, acousticness: 0, valence: 0, danceability: 0 }
    );

    return {
      energy: totals.energy / songs.length,
      acousticness: totals.acousticness / songs.length,
      valence: totals.valence / songs.length,
      danceability: totals.danceability / songs.length,
    };
  };

  const metrics = calculateAverageMetrics(playlist.items);

  if (!metrics) {
    return null;
  }

  const metricsConfig = [
    {
      name: 'Energy',
      value: metrics.energy,
      icon: Activity,
      color: 'text-yellow-400',
      description: 'Average Energy Level',
    },
    {
      name: 'Acousticness',
      value: metrics.acousticness,
      icon: Music2,
      color: 'text-blue-400',
      description: 'Average Acoustic Elements',
    },
    {
      name: 'Valence',
      value: metrics.valence,
      icon: Heart,
      color: 'text-red-400',
      description: 'Average Musical Positivity',
    },
    {
      name: 'Danceability',
      value: metrics.danceability,
      icon: Volume2,
      color: 'text-green-400',
      description: 'Average Dance Rhythm',
    },
  ];

  const handleClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.closest('.expand-button') || target.closest('.song-list')) {
      e.stopPropagation();
      return;
    }
    onSelect(playlist.playlist.id, playlist.playlist.playlist_name);
  };

  return (
    <div
      className="w-full max-w-xl bg-black rounded-lg p-4 cursor-pointer"
      onClick={handleClick}
    >
      {/* Top section - Title and song count */}
      <div className="flex items-center justify-between mb-4 w-full">
        <div className="flex items-center gap-2">
          <div className="p-1 bg-purple-100 rounded-sm">
            <Music className="w-4 h-4 text-purple-600" />
          </div>
          <h3 className="text-sm font-semibold text-white">
            {playlist.playlist.playlist_name}
          </h3>
        </div>
        <div className="flex items-center gap-3">
          {onDelete && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (
                  window.confirm(
                    'Are you sure you want to delete this playlist?'
                  )
                ) {
                  onDelete(playlist.playlist.id);
                }
              }}
              className="p-1.5 rounded-full text-gray-400 hover:text-red-400"
              title="Delete playlist"
            >
              <Trash2 size={16} />
            </button>
          )}
        </div>
      </div>

      {/* Album Image Carousel */}
      {playlist.items.some((song) => song.album_image) && (
        <div className="flex gap-2 overflow-x-auto py-2 mb-4 [&::-webkit-scrollbar]:h-1 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-black [&::-webkit-scrollbar-thumb]:bg-gray-600 [&::-webkit-scrollbar-thumb]:rounded-full">
          {playlist.items.map((song) =>
            song.album_image ? (
              <div
                key={song.song_id}
                className="w-20 h-20 relative flex-shrink-0"
              >
                <Image
                  src={song.album_image}
                  alt={song.song}
                  title={`${song.song} by ${song.artist}`}
                  fill
                  sizes="80px"
                  priority
                  className="rounded-lg object-cover border border-gray-800"
                  onError={() => {
                    console.error('Failed to load image:', song.album_image);
                    // You can set a fallback image here if needed
                  }}
                />
              </div>
            ) : null
          )}
        </div>
      )}

      {/* Bottom section - Metrics */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          {metricsConfig.map((metric) => {
            const IconComponent = metric.icon;
            return (
              <div
                key={metric.name}
                className="flex items-center gap-1.5 group/metric relative cursor-help"
              >
                <div className="p-1.5 rounded-full transition-transform group-hover/metric:scale-110 bg-gray-900">
                  <IconComponent className={`w-3.5 h-3.5 ${metric.color}`} />
                </div>
                <div className="text-xs font-semibold text-gray-300">
                  {Math.round(metric.value * 100)}%
                </div>
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded-md opacity-0 group-hover/metric:opacity-100 transition-opacity duration-200 whitespace-nowrap">
                  {metric.description}
                </div>
              </div>
            );
          })}
        </div>
        <div className="flex items-center gap-4">
          <p className="text-sm text-gray-300">
            {playlist.playlist.playlist_items.length} songs
          </p>
          <button
            className="expand-button p-1.5 rounded-full bg-gray-900 text-gray-400 hover:text-white transition-colors transform transition-transform duration-200"
            onClick={() => setIsExpanded(!isExpanded)}
            style={{
              transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
            }}
          >
            <ChevronDown size={16} />
          </button>
        </div>
      </div>

      {/* Song List */}
      {isExpanded && (
        <div className="song-list mt-4 space-y-2 pl-4 border-l-2 border-gray-800">
          {playlist.items.map((song) => (
            <div
              key={song.song_id}
              className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"
            >
              <Music2 size={14} className="text-purple-400" />
              <span className="font-medium">{song.song}</span>
              <span className="text-gray-500">by</span>
              <span>{song.artist}</span>
              <span className="text-gray-600 text-xs">• {song.genre}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PlaylistCard;
