import { Heart, Search } from 'lucide-react';
import { useState } from 'react';
import React from 'react';
import SongCard from '@/components/ChatComponents/SongCard';
import { Song } from '@/types/MoodifyTypes';

interface ChatSongProps {
  song: Song;
  addSong?: () => void;
  findSimilar?: () => void;
}

const ChatSong: React.FC<ChatSongProps> = ({ song, addSong }) => {
  const [liked, setLiked] = useState(false);

  const toggleLike = () => {
    setLiked(!liked);
    if (!liked && addSong) addSong();
  };

  return (
    <div className="relative w-full max-w-xl p-2 pb-14 bg-gray-800 rounded-lg shadow-md">
      <SongCard title={song.name} artist={song.artist} />

      <div className="absolute bottom-2 right-2 flex gap-2">
        <button
          onClick={() => {}}
          title="Find Similar"
          className="p-2 rounded-full hover:bg-gray-200 hover:text-black text-white transition-colors"
        >
          <Search size={20} />
        </button>
        <button
          onClick={toggleLike}
          title="Like"
          className={`p-2 rounded-full hover:bg-gray-200 transition-colors ${
            liked ? 'text-red-500' : 'text-white hover:text-black'
          }`}
        >
          <Heart size={20} fill={liked ? 'currentColor' : 'none'} />
        </button>
      </div>
    </div>
  );
};

export default ChatSong;
