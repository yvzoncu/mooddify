import React from 'react';
import Image from 'next/image';

export default function EmotionHeaderCard({
  imageUrl = 'https://mood-pictures.s3.eu-north-1.amazonaws.com/moody_newpost_image.jpeg',
}) {
  return (
    <div>
      <div className="text-center mb-6 max-w-prose mx-auto space-y-2 px-4">
        <p className="text-gray-800 text-lg md:text-xl font-semibold leading-snug">
          Your emotions, your playlist...
        </p>
      </div>
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

      {/* Centered and Styled Text */}
      <div className="text-center mt-6 max-w-prose mx-auto space-y-2 px-4">
        <p className="text-gray-600 text-base md:text-lg leading-relaxed">
          Let’s find your perfect soundtrack based on your mood!
        </p>
      </div>
    </div>
  );
}
