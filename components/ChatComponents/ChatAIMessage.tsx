import React from 'react';
import { SongItem } from '@/types/MoodifyTypes';

interface ChatAIMessageProps {
  content: string;
  avatar?: string;
}

// Helper to parse text into string and Song[] parts
const extractContentParts = (text: string): (string | SongItem)[] => {
  // Updated regex to also capture the song_id at the end (#song_id#)
  const regex = /#([^#,]+?)\s*,\s*([^#]+?)#\s*#(\d+)#/g;
  const parts: (string | SongItem)[] = [];
  const lastIndex = 0;
  let match;

  while ((match = regex.exec(text)) !== null) {
    const start = match.index;

    if (start > lastIndex) {
      parts.push(text.slice(lastIndex, start));
    }
  }

  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return parts;
};

const ChatAIMessage: React.FC<ChatAIMessageProps> = ({ content }) => {
  const contentParts = extractContentParts(content);

  return (
    <div className="ml-10 space-y-4">
      {contentParts.map((part, idx) =>
        typeof part === 'string' ? (
          <p key={idx}>{part}</p>
        ) : (
          <p key={idx}>
            {part.song} by {part.artist}
          </p>
        )
      )}
    </div>
  );
};

export default ChatAIMessage;
