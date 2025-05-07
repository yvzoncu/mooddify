import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import Image from 'next/image';

export default function EmotionHeaderCard({
  imageUrl = 'https://mood-pictures.s3.eu-north-1.amazonaws.com/moody_newpost_image.jpeg',
  textVariant = 2,
}) {
  // Base S3 URL - replace with your actual bucket URL structure

  // Text options for different feels and engagement levels
  const textOptions = [
    "Let's find your perfect soundtrack based on your mood!",
    "How are you feeling? Let's find music to match!",
    "Your emotions, your playlist... Let's find your perfect soundtrack based on your mood!",
    'Turn your feelings into the perfect soundtrack',
    'Ready to discover music that feels like you do right now?',
    "Your mood deserves the perfect playlist — let's find it!",
  ];

  // Select text based on variant (with fallback)
  const displayText = textOptions[textVariant] || textOptions[0];

  return (
    <Card className="w-full max-w-lg shadow-sm bg-white mb-4">
      <CardContent className="p-4 space-y-4">
        <div className="relative w-full h-64 rounded-md overflow-hidden">
          <Image
            src={imageUrl}
            alt="Emotion illustration"
            className="object-cover"
            fill
            sizes="(max-width: 768px) 100vw, 700px"
            priority
          />
        </div>

        {/* Content */}
        <p className="text-gray-700 leading-relaxed">{displayText}</p>
      </CardContent>
    </Card>
  );
}
