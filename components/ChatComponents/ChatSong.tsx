import SongCard from '@/components/ChatComponents/SongCard';
import { Song } from '@/types/MoodifyTypes';

interface ChatSongProps {
  song: Song;
  addSong?: () => void;
}

const ChatSong: React.FC<ChatSongProps> = ({ song, addSong }) => {
  return (
    <div
      className=" w-full max-w-xl p-4 cursor-pointer bg-white"
      onClick={addSong}
    >
      <SongCard title={song.name} artist={song.artist} />
    </div>
  );
};

export default ChatSong;
