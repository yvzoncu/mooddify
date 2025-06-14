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
  playlistId: number;
  userId: string;
  userName: string;
  userEmail: string;
}

const PlaylistMetrics: React.FC<PlaylistMetricsProps> = ({
  songs,
  title,
  playlistId,
  userId,
  userName,
  userEmail,
}) => {
  const [hiddenMetrics, setHiddenMetrics] = useState<Set<string>>(new Set());
  const [isSharing, setIsSharing] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [ownerNotes, setOwnerNotes] = useState('');
  const [shareUrl, setShareUrl] = useState('');

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
          playlist_id: playlistId,
          user_id: userId,
          user_name: name,
          owner_notes: ownerNotes,
        }),
      });
      if (!response.ok) throw new Error('Failed to get share link');
      const data = await response.json();
      const url = data.share_url || data.url || data.link || '';
      if (!url) throw new Error('No share URL returned');
      setShareUrl(url); // Show the link in the modal
    } catch (err: unknown) {
      let message = 'Unknown error';
      if (err instanceof Error) message = err.message;
      else if (typeof err === 'string') message = err;
      alert('Failed to share playlist: ' + message);
    } finally {
      setIsSharing(false);
    }
  };

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
            onClick={() => setShowShareModal(true)}
            className="p-1.5 rounded-full hover:bg-gray-800 transition-colors text-gray-400 hover:text-white disabled:opacity-50"
            title="Share playlist"
            disabled={isSharing}
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

      {showShareModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="bg-gray-900 p-6 rounded-lg shadow-lg w-full max-w-md">
            <h2 className="text-lg font-bold text-white mb-4">
              Share Playlist
            </h2>
            {shareUrl ? (
              <div>
                <div className="mb-4">
                  <label className="block text-gray-300 mb-2">
                    Share this link:
                  </label>
                  <input
                    className="w-full p-2 rounded bg-gray-800 text-white border border-gray-700 mb-2"
                    value={shareUrl}
                    readOnly
                    onFocus={(e) => e.target.select()}
                  />
                  <button
                    className="px-3 py-1 bg-purple-600 text-white rounded hover:bg-purple-700 mr-2"
                    onClick={async () => {
                      if (
                        navigator.clipboard &&
                        navigator.clipboard.writeText
                      ) {
                        await navigator.clipboard.writeText(shareUrl);
                        alert('Link copied!');
                      } else {
                        window.prompt('Copy this link:', shareUrl);
                      }
                    }}
                  >
                    Copy Link
                  </button>
                  {navigator.share && (
                    <button
                      className="px-3 py-1 bg-gray-700 text-white rounded hover:bg-gray-600"
                      onClick={async () => {
                        await navigator.share({
                          title: 'Check out this playlist!',
                          url: shareUrl,
                        });
                      }}
                    >
                      Share
                    </button>
                  )}
                </div>
                <button
                  className="px-4 py-2 rounded bg-gray-700 text-white hover:bg-gray-600 w-full"
                  onClick={() => {
                    setShowShareModal(false);
                    setOwnerNotes('');
                    setShareUrl('');
                  }}
                >
                  Close
                </button>
              </div>
            ) : (
              <>
                <textarea
                  className="w-full p-2 rounded bg-gray-800 text-white border border-gray-700 mb-4 resize-none"
                  rows={4}
                  maxLength={200}
                  placeholder="Do you want to add a note to your shared playlist? (max 200 chars)"
                  value={ownerNotes}
                  onChange={(e) => setOwnerNotes(e.target.value)}
                  disabled={isSharing}
                />
                <div className="flex justify-end gap-2">
                  <button
                    className="px-4 py-2 rounded bg-gray-700 text-white hover:bg-gray-600"
                    onClick={() => {
                      setShowShareModal(false);
                      setOwnerNotes('');
                      setShareUrl('');
                    }}
                    disabled={isSharing}
                  >
                    Cancel
                  </button>
                  <button
                    className="px-4 py-2 rounded bg-purple-600 text-white font-semibold hover:bg-purple-700 disabled:opacity-50"
                    onClick={handleShare}
                    disabled={isSharing || ownerNotes.length > 200}
                  >
                    {isSharing ? 'Generating link...' : 'Get Link'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default PlaylistMetrics;
