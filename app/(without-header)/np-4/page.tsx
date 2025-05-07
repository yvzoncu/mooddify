'use client';

import { EmotionProvider } from '@/contexts/EmotionContext';
import { useEmotion } from '@/contexts/EmotionContext';
import NewPostSteps from '@/components/Np4Components/NewPostSteps';
import MoodTracker from '@/components/Np4Components/MoodTracker';
import SongPicker from '@/components/Np4Components/SongPicker';
import CreateMood from '@/components/Np4Components/CreateMood';

export default function Np4() {
  return (
    <EmotionProvider>
      <div className="min-h-screen w-full bg-indigo-50 flex justify-center ">
        <main className="flex flex-col w-xl max-w-xl min-h-screen p-4">
          {/* Sticky header */}
          <div className="sticky top-0 z-10 bg-indigo-50 ">
            <NewPostSteps />
          </div>

          {/* Scrollable content */}
          <div className="flex-1 overflow-y-auto px-2 pb-10">
            <Np4Content />
          </div>
        </main>
      </div>
    </EmotionProvider>
  );
}

function Np4Content() {
  const { intensity } = useEmotion();

  return (
    <div>
      {intensity === 1 && <MoodTracker />}
      {intensity === 2 && <SongPicker />}
      {intensity === 3 && <CreateMood />}
    </div>
  );
}
