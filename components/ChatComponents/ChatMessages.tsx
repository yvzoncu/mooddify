'use client';

import SongCard from '@/components/ChatComponents/SongCard';
import { SongItem } from '@/types/MoodifyTypes';

interface Message {
  type: 'user' | 'ai' | 'song' | 'loading';
  content: string;
  song?: SongItem;
}

const LoadingMessage = () => (
  <div className="ml-10 animate-pulse text-gray-400 ">Loading...</div>
);

interface ChatMessageProps {
  msg: Message;
  addSong?: () => void;
}

const ChatMessage = ({ msg, addSong }: ChatMessageProps) => {
  if (msg.type === 'song' && msg.song) {
    return (
      <div className="ml-10 max-w-xl p-4 cursor-pointer" onClick={addSong}>
        <SongCard
          id={msg.song.song_id}
          song={msg.song.song}
          artist={msg.song.artist}
          spotify_id={msg.song.spotify_id}
          album_image={msg.song.album_image}
        />
      </div>
    );
  }

  if (msg.type === 'user') {
    return (
      <div className="flex">
        <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center mr-2">
          Y
        </div>
        <div className="flex-1">
          <p>{msg.content}</p>
        </div>
      </div>
    );
  }

  if (msg.type === 'ai') {
    return (
      <div className="ml-10">
        <p>{msg.content}</p>
      </div>
    );
  }

  if (msg.type === 'loading') {
    return <LoadingMessage />;
  }

  return null;
};

export default ChatMessage;
