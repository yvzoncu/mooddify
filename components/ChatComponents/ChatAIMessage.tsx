import React from 'react';
import ChatSong from '@/components/ChatComponents/ChatSong';
import { Song } from '@/types/MoodifyTypes';

interface ChatAIMessageProps {
  content: string;
  avatar?: string;
  onSongSelect?: (song: Song) => void;
}

// Helper to parse text into string and Song[] parts
const extractContentParts = (text: string): (string | Song)[] => {
  const regex = /#([^#,]+?)\s*,\s*([^#]+?)#/g;
  const parts: (string | Song)[] = [];
  let lastIndex = 0;
  let match;

  while ((match = regex.exec(text)) !== null) {
    const [, name, artist] = match;
    const start = match.index;

    if (start > lastIndex) {
      parts.push(text.slice(lastIndex, start));
    }

    // Create a valid Song object
    const song: Song = {
      name: name.trim(),
      artist: artist.trim(),
    };

    parts.push(song);
    lastIndex = regex.lastIndex;
  }

  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return parts;
};

const ChatAIMessage: React.FC<ChatAIMessageProps> = ({
  content,
  onSongSelect,
}) => {
  const contentParts = extractContentParts(content);

  return (
    <div className="ml-10 space-y-4">
      {contentParts.map((part, idx) =>
        typeof part === 'string' ? (
          <p key={idx}>{part}</p>
        ) : (
          <ChatSong
            key={idx}
            song={part}
            addSong={() => onSongSelect?.(part)}
          />
        )
      )}
    </div>
  );
};

export default ChatAIMessage;
