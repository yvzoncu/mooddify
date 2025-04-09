'use client';

import React from 'react';
import { EmotionProvider } from '@/contexts/EmotionContext';
import EmotionCard from '@/components/EmotionCard';

export default function Home() {
  const user = {
    name: 'Sarah Mitchell',
    avatar:
      'https://mood-pictures.s3.eu-north-1.amazonaws.com/woman-3289372_640.jpg',
    date: 'April 8, 2025 • 10:00 AM',
  };

  const imageUrl =
    'https://mood-pictures.s3.eu-north-1.amazonaws.com/joy-7853671_1280.jpg';

  return (
    <EmotionProvider>
      <main className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
        <EmotionCard user={user} image={imageUrl} />
        <EmotionCard
          user={user}
          youtubeUrl="https://youtu.be/oJDzh2mVBms?si=Hyd28G-0jHBLSoHC"
        />
        <EmotionCard
          user={user}
          image={imageUrl}
          songId="7lQ8MOhq6IN2w8EYcFNSUk"
        />
      </main>
    </EmotionProvider>
  );
}
