import { useEmotion } from '@/contexts/EmotionContext';
import { Heart, Music, CircleDot } from 'lucide-react';

export default function NewPostSteps({}) {
  const { intensity, setIntensity } = useEmotion();

  const steps = [
    {
      id: 1,
      title: 'Find Your Mood',
      icon: <Heart className="w-6 h-6 text-gray-300" />,
      selectedIcon: <Heart className="w-6 h-6 text-white" />,
    },
    {
      id: 2,
      title: 'Pick Your Songs',
      icon: <Music className="w-6 h-6 text-gray-300" />,
      selectedIcon: <Music className="w-6 h-6 text-white" />,
    },
    {
      id: 3,
      title: 'Get Your Fortune',
      icon: <CircleDot className="w-6 h-6 text-gray-300" />,
      selectedIcon: <CircleDot className="w-6 h-6 text-white" />,
    },
  ];

  return (
    <div className="flex justify-between w-full max-w-lg mb-12 relative">
      {steps.map((step) => (
        <div key={step.id} className="flex flex-col items-center z-10 relative">
          <div
            onClick={() => setIntensity(step.id)}
            className={`cursor-pointer w-12 h-12 rounded-full flex items-center justify-center ${
              intensity === step.id ? 'bg-purple-800' : 'bg-purple-300'
            }`}
          >
            {intensity === step.id ? step.selectedIcon : step.icon}
          </div>
          <p
            className={`mt-2 text-sm ${
              intensity === step.id ? ' font-semi-bold' : 'text-purple-300'
            }`}
          >
            {step.title}
          </p>
        </div>
      ))}
      {/* Progress line */}
      <div className="absolute top-6 left-0 right-0 h-0.5 bg-purple-600 -z-0" />
    </div>
  );
}
