import React from 'react';
import {
  Heart,
  Smile,
  Frown,
  Music,
  AlertTriangle,
  Eye,
  Share2,
  Sparkles,
} from 'lucide-react';
import { SongEmotions } from '@/types/MoodifyTypes';

type EmotionCardProps = {
  songData?: SongEmotions[];
  title?: string;
};

const emotionConfig = [
  { name: 'joy', color: '#FFD700', icon: Smile },
  { name: 'love', color: '#FF69B4', icon: Heart },
  { name: 'surprise', color: '#FF8C00', icon: Eye },
  { name: 'fear', color: '#9370DB', icon: AlertTriangle },
  { name: 'anger', color: '#FF4500', icon: AlertTriangle },
  { name: 'sadness', color: '#4682B4', icon: Frown },
];

const EmotionMeter: React.FC<EmotionCardProps> = ({ songData = [], title }) => {
  const sampleData: SongEmotions[] = [];

  const dataToUse = songData.length > 0 ? songData : sampleData;

  const calculateOverallEmotions = (
    songs: SongEmotions[]
  ): Record<string, number> => {
    const emotionTotals: Record<string, number> = {};
    const totalSongs = songs.length;

    songs.forEach((song) => {
      song.forEach((emotionObj) => {
        const [emotion, value] = Object.entries(emotionObj)[0] || [];
        if (emotion && typeof value === 'number') {
          emotionTotals[emotion] = (emotionTotals[emotion] || 0) + value;
        }
      });
    });

    const emotionPercentages: Record<string, number> = {};
    for (const emotion in emotionTotals) {
      emotionPercentages[emotion] = Math.round(
        (emotionTotals[emotion] / totalSongs) * 100
      );
    }

    return emotionPercentages;
  };

  const overallEmotions = calculateOverallEmotions(dataToUse);

  // Filter and sort emotions that exist in the data
  const displayEmotions = emotionConfig
    .filter(
      (emotion) =>
        overallEmotions[emotion.name] && overallEmotions[emotion.name] > 0
    )
    .map((emotion) => ({
      ...emotion,
      percentage: overallEmotions[emotion.name],
    }));

  return (
    <div className="items-start w-full max-w-xl bg-black rounded-xl shadow-sm border border-black p-4 h-20 flex flex-col mb-4">
      {/* Top section - Title left, song count and action buttons right */}
      <div className="flex items-center justify-between mb-2 w-full">
        <div className="flex items-center gap-2">
          <div className="p-1 bg-purple-100 rounded-sm">
            <Music className="w-4 h-4 text-purple-600" />
          </div>
          <h3 className="text-sm font-semibold text-gray-300">
            {title || 'Mood playlist'}
          </h3>
        </div>
        <div className="flex items-center gap-2">
          <p className="text-xs text-gray-300">{dataToUse.length} songs</p>
          <button
            className="p-1.5 rounded-full hover:bg-gray-800 transition-colors text-gray-400 hover:text-white"
            title="Share playlist"
          >
            <Share2 size={16} />
          </button>
          <button
            className="p-1.5 rounded-full hover:bg-gray-800 transition-colors text-gray-400 hover:text-white"
            title="AI analysis"
          >
            <Sparkles size={16} />
          </button>
        </div>
      </div>

      {/* Bottom section - Emotion breakdown */}
      <div className="flex items-center justify-start gap-4 flex-1 mb-2">
        {displayEmotions.length > 0 ? (
          displayEmotions.map((emotion) => {
            const IconComponent = emotion.icon;

            return (
              <div
                key={emotion.name}
                className="flex items-center gap-1.5 group cursor-pointer"
              >
                <div
                  className="p-1.5 rounded-full transition-transform group-hover:scale-110"
                  style={{ backgroundColor: `${emotion.color}20` }}
                >
                  <IconComponent
                    className="w-3.5 h-3.5"
                    style={{ color: emotion.color }}
                  />
                </div>
                <div className="text-xs font-semibold text-gray-300">
                  {emotion.percentage}%
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-xs text-gray-400">No emotion data</div>
        )}
      </div>
    </div>
  );
};

export default EmotionMeter;
