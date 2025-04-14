'use client';

import React from 'react';
import { EmotionProvider } from '@/contexts/EmotionContext';
import EmotionWheelCard from '@/components/new-post-components/EmotionWheelCard';
import IntensityCard from '@/components/new-post-components/IntensityCard';
import ContextCard from '@/components/new-post-components/ContextCard';
import MusicRecommendation from '@/components/new-post-components/MusicRecommendation';
import TagsCard from '@/components/new-post-components/TagsCard';
import MoodSummaryCard from '@/components/new-post-components/MoodSummary';
import PictureUploadCard from '@/components/new-post-components/ImageUpload';
import Link from 'next/link';

export default function Home() {
  return (
    <EmotionProvider>
      <main className="min-h-screen bg-indigo-50 flex flex-col items-center justify-center p-6">
        <EmotionWheelCard />
        <IntensityCard />
        <ContextCard />
        <TagsCard />
        <MusicRecommendation />
        <PictureUploadCard />
        <MoodSummaryCard />

        <Link
          href="/"
          className="w-full max-w-lg m-5 bg-indigo-600 text-white px-4 py-2 rounded-md shadow-md text-xl text-center"
        >
          Publish your mood
        </Link>
      </main>
    </EmotionProvider>
  );
}
