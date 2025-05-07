'use client';

import { useEffect, useRef } from 'react';
import { EmotionProvider } from '@/contexts/EmotionContext';
import EmotionWheelCard from '@/components/new-post-components/EmotionWheelCard';
import ContextCard from '@/components/new-post-components/ContextCard';
import TagsCard from '@/components/new-post-components/TagsCard';
import EmotionHeaderCard from '@/components/Np-2-Components/IntroPicture';
import { useEmotion } from '@/contexts/EmotionContext';
import AutoRecommendationCard from '@/components/Np-2-Components/AutoRecomendations';
import MoodSummaryCard from '@/components/new-post-components/MoodSummary';

export default function Np() {
  return (
    <EmotionProvider>
      <NpContent />
    </EmotionProvider>
  );
}

function NpContent() {
  const { selectedEmotion, selectedContexts, selectedTags, selectedSongs } =
    useEmotion();
  const contentEndRef = useRef<HTMLDivElement | null>(null); // ✅ type the ref

  useEffect(() => {
    contentEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [
    selectedEmotion,
    selectedContexts.length,
    selectedTags.length,
    selectedSongs.length,
  ]);

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100 p-4">
      <div className="w-full max-w-xl shadow-lg m-5 bg-gray-50 rounded-lg overflow-hidden">
        <div className="p-6 space-y-6 overflow-y-auto">
          <EmotionHeaderCard />
          <EmotionWheelCard />
          {selectedEmotion && <ContextCard />}
          {selectedContexts.length > 0 && <TagsCard />}
          {selectedTags.length > 0 && <AutoRecommendationCard />}
          {selectedSongs.length > 0 && <MoodSummaryCard />}
          <div ref={contentEndRef} /> {/* 👈 This is now properly typed */}
        </div>
      </div>
    </div>
  );
}
