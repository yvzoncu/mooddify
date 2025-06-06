import React, { useState } from 'react';
import {
  Activity,
  Music2,
  Heart,
  Volume2,
  Music,
  Share2,
  Sparkles,
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
} from 'recharts';
import * as TooltipPrimitive from '@radix-ui/react-tooltip';

interface SongMetrics {
  song: string;
  energy: number;
  acousticness: number;
  valence: number;
  danceability: number;
}

interface PlaylistMetricsProps {
  songs: SongMetrics[];
  title: string;
}

const PlaylistMetrics: React.FC<PlaylistMetricsProps> = ({ songs, title }) => {
  const [hiddenMetrics, setHiddenMetrics] = useState<Set<string>>(new Set());

  const toggleMetric = (metricName: string) => {
    setHiddenMetrics((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(metricName)) {
        newSet.delete(metricName);
      } else {
        newSet.add(metricName);
      }
      return newSet;
    });
  };

  // Transform songs data for the chart
  const chartData = songs.map((song) => ({
    name: song.song,
    Energy: Math.round(song.energy * 100),
    Acousticness: Math.round(song.acousticness * 100),
    Valence: Math.round(song.valence * 100),
    Danceability: Math.round(song.danceability * 100),
  }));

  const metrics = [
    {
      name: 'Energy',
      color: '#FBBF24', // yellow-400
      icon: Activity,
      description:
        'Represents the intensity and activity level of the song, from calm to energetic',
    },
    {
      name: 'Acousticness',
      color: '#60A5FA', // blue-400
      icon: Music2,
      description: 'Measures how acoustic (vs. electronic) the song is',
    },
    {
      name: 'Valence',
      color: '#F87171', // red-400
      icon: Heart,
      description: 'Describes the musical positiveness, from sad to happy',
    },
    {
      name: 'Danceability',
      color: '#34D399', // green-400
      icon: Volume2,
      description: 'Indicates how suitable the song is for dancing',
    },
  ];

  return (
    <div className="w-full max-w-xl bg-black rounded-xl shadow-sm border border-black p-4 flex flex-col mb-4">
      {/* Top section - Title left, song count and action buttons right */}
      <div className="flex items-center justify-between mb-4 w-full">
        <div className="flex items-center gap-2">
          <div className="p-1 bg-purple-100 rounded-sm">
            <Music className="w-4 h-4 text-purple-600" />
          </div>
          <h3 className="text-sm font-semibold text-gray-300">{title}</h3>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              // TODO: Implement share functionality
              alert('Share functionality coming soon!');
            }}
            className="p-1.5 rounded-full hover:bg-gray-800 transition-colors text-gray-400 hover:text-white"
            title="Share playlist"
          >
            <Share2 size={16} />
          </button>
          <button
            onClick={() => {
              // TODO: Implement AI analysis
              alert('AI analysis coming soon!');
            }}
            className="p-1.5 rounded-full hover:bg-gray-800 transition-colors text-gray-400 hover:text-white"
            title="AI analysis"
          >
            <Sparkles size={16} />
          </button>
        </div>
      </div>

      {/* Chart section */}
      <div className="w-full h-[80px] mt-4">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <XAxis dataKey="name" hide />
            <YAxis hide tickFormatter={(value) => `${value}%`} />
            <RechartsTooltip
              contentStyle={{
                backgroundColor: '#1F2937',
                border: 'none',
                borderRadius: '0.5rem',
                color: '#F3F4F6',
              }}
              itemStyle={{ color: '#F3F4F6' }}
            />
            {metrics
              .filter((metric) => !hiddenMetrics.has(metric.name))
              .map((metric) => (
                <Line
                  key={metric.name}
                  type="monotone"
                  dataKey={metric.name}
                  stroke={metric.color}
                  strokeWidth={2}
                  dot={{
                    fill: metric.color,
                    strokeWidth: 0,
                  }}
                  activeDot={{
                    r: 6,
                    fill: metric.color,
                    stroke: '#111827',
                    strokeWidth: 2,
                  }}
                />
              ))}
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Legend with icons */}
      <TooltipPrimitive.Provider>
        <div className="flex justify-center gap-6 mt-4">
          {metrics.map((metric) => {
            const IconComponent = metric.icon;
            const isHidden = hiddenMetrics.has(metric.name);
            return (
              <TooltipPrimitive.Root key={metric.name}>
                <TooltipPrimitive.Trigger asChild>
                  <button
                    onClick={() => toggleMetric(metric.name)}
                    className={`cursor-pointer flex items-center gap-2 transition-opacity duration-200 ${
                      isHidden ? 'opacity-40' : 'opacity-100'
                    }`}
                    style={{ color: metric.color }}
                  >
                    <IconComponent size={16} />
                    <span className="text-xs font-medium">{metric.name}</span>
                  </button>
                </TooltipPrimitive.Trigger>
                <TooltipPrimitive.Portal>
                  <TooltipPrimitive.Content
                    className="rounded-md bg-gray-800 px-3 py-2 text-xs text-gray-200 max-w-[200px] z-50"
                    sideOffset={5}
                  >
                    {metric.description}
                    <TooltipPrimitive.Arrow className="fill-gray-800" />
                  </TooltipPrimitive.Content>
                </TooltipPrimitive.Portal>
              </TooltipPrimitive.Root>
            );
          })}
        </div>
      </TooltipPrimitive.Provider>
    </div>
  );
};

export default PlaylistMetrics;
