'use client';

import React from 'react';
import { EmotionProvider } from '@/contexts/EmotionContext';
import EmotionWheelCard from '@/components/EmotionWheelCard';
import IntensityCard from '@/components/IntensityCard';
import ContextCard from '@/components/ContextCard';
import MusicRecommendation from '@/components/MusicRecommendation';
import TagsCard from '@/components/TagsCard';
import MoodSummaryCard from '@/components/MoodSummary';
import PictureUploadCard from '@/components/ImageUpload';
import Link from 'next/link';

export default function Home() {
  return (
    <EmotionProvider>
      <main className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
        <EmotionWheelCard />
        <IntensityCard />
        <ContextCard />
        <TagsCard />
        <MusicRecommendation />
        <PictureUploadCard />
        <MoodSummaryCard />

        <Link
          href="/"
          className="w-full max-w-lg m-5 bg-blue-500 text-white px-4 py-2 rounded-md shadow-md text-xl text-center"
        >
          Publish your mood
        </Link>
      </main>
    </EmotionProvider>
  );
}
