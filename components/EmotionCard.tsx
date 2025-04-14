'use client';

import React from 'react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, Heart, MessageSquare, Share2 } from 'lucide-react';
import Image from 'next/image';
import dynamic from 'next/dynamic';

const ReactPlayer = dynamic(() => import('react-player/youtube'), {
  ssr: false,
});

interface EmotionCardProps {
  user: {
    name: string;
    avatar: string;
    date: string;
  };
  emotion?: {
    emoji: string;
    name: string;
    description: string;
  };
  categories?: string[];
  tags?: string[];
  content?: string;
  songId?: string;
  image?: string; // Optional image URL
  youtubeUrl?: string; // Optional YouTube video ID
}

export default function EmotionCard({
  user,
  emotion = {
    emoji: '😊',
    name: 'Joy',
    description: 'Gentle ripple',
  },
  categories = ['Music', 'Social', 'Work'],
  tags = ['#SunshineVibes', '#GoodDay', '#DanceParty'],
  content = 'Today feels like dancing with a mild intensity. This moment reflects a deeply personal emotional state shaped by your current environment. The combination of music, social interactions, and work has created a harmonious blend of joy and contentment. The gentle ripple of happiness flows through every moment, making this day particularly special and memorable.',
  songId,
  image,
  youtubeUrl,
}: EmotionCardProps) {
  return (
    <Card className="w-full max-w-lg shadow-sm bg-white mb-4">
      {/* User Header */}
      <div className="p-4 flex items-center border-b">
        <div className="relative w-10 h-10 mr-3">
          <Image
            src={user.avatar}
            alt={user.name}
            className="rounded-full object-cover"
            fill
            sizes="40px"
            priority
          />
        </div>
        <div>
          <h3 className="font-medium text-gray-900">{user.name}</h3>
          <p className="text-sm text-gray-500">{user.date}</p>
        </div>
      </div>

      <CardContent className="p-4 space-y-4">
        {/* Emotion Header */}
        <div className="flex items-center gap-2 text-lg">
          <span className="text-2xl">{emotion.emoji}</span>
          <span className="font-medium">{emotion.name}</span>
          <span className="text-gray-400">•</span>
          <span className="text-indigo-500">{emotion.description}</span>
        </div>

        {/* Categories */}
        <div className="flex gap-3">
          {categories.map((category, index) => (
            <div
              key={index}
              className="flex items-center text-gray-600 text-sm"
            >
              {index === 0 && <span className="mr-1">🎵</span>}
              {index === 1 && <span className="mr-1">👥</span>}
              {index === 2 && <span className="mr-1">💼</span>}
              {category}
            </div>
          ))}
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-2">
          {tags.map((tag, index) => (
            <span
              key={index}
              className="bg-indigo-100 text-indigo-600 px-3 py-1 rounded-full text-sm"
            >
              {tag}
            </span>
          ))}
        </div>

        {/* Spotify Embed (Optional) */}
        {songId && (
          <div className="w-full mt-2">
            <iframe
              src={`https://open.spotify.com/embed/track/${songId}?utm_source=generator&theme=0`}
              width="100%"
              height="80"
              frameBorder="0"
              allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
              allowFullScreen
              title={`Spotify: Happy - Pharrell Williams`}
            />
          </div>
        )}

        {/* Conditional: YouTube Video (priority) or Image */}
        {youtubeUrl ? (
          <div className="relative w-full aspect-video rounded-md overflow-hidden">
            <ReactPlayer
              url={youtubeUrl}
              className="react-player"
              width="100%"
              height="100%"
              style={{ position: 'absolute', top: 0, left: 0 }}
              controls
            />
          </div>
        ) : image ? (
          <div className="relative w-full h-64 rounded-md overflow-hidden">
            <Image
              src={image}
              alt="Emotion illustration"
              className="object-cover"
              fill
              sizes="(max-width: 768px) 100vw, 700px"
              priority
            />
          </div>
        ) : null}

        {/* Content */}
        <p className="text-gray-700 leading-relaxed">{content}</p>
      </CardContent>

      {/* Footer */}
      <CardFooter className="border-t p-2 flex justify-between">
        <div className="flex gap-4">
          <Button variant="ghost" size="sm" className="text-gray-600">
            <Heart size={18} className="mr-1" /> Like
          </Button>
          <Button variant="ghost" size="sm" className="text-gray-600">
            <MessageSquare size={18} className="mr-1" /> Comment
          </Button>
          <Button variant="ghost" size="sm" className="text-gray-600">
            <Share2 size={18} className="mr-1" /> Share
          </Button>
        </div>
        <Button variant="ghost" size="icon" className="text-gray-600">
          <MoreHorizontal size={18} />
        </Button>
      </CardFooter>
    </Card>
  );
}
