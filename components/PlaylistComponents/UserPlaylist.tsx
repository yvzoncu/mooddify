import { SongItem } from '@/types/MoodifyTypes';
import SongCard from '@/components/ChatComponents/SongCard';
import { Delete } from 'lucide-react';
import EmotionMeter from '../ListComponents/EmotionMeter';
import { getSelectedSongEmotionsList } from '@/utils/songUtils';

interface PlaylistData {
  playlist: {
    id: number;
    user_id: string;
    playlist_name: string;
    playlist_items: Array<{ song_id: number }>;
  };
  items: SongItem[];
}

interface UserPlaylistProps {
  playlistData: PlaylistData | null;
  isLoading: boolean;

  onReemoveSongFromPlaylist: (
    playlistId: number,
    song_id: number,
    action: string
  ) => void;
}

const UserPlaylist = ({
  playlistData,
  isLoading,
  onReemoveSongFromPlaylist,
}: UserPlaylistProps) => {
  if (isLoading) {
    return (
      <div className="text-gray-500 text-center p-4">Loading playlist...</div>
    );
  }

  if (!playlistData) {
    return (
      <div className="text-gray-500 text-center p-4">
        No playlist data available
      </div>
    );
  }

  return (
    <div>
      <div className="space-y-4">
        <EmotionMeter
          songData={getSelectedSongEmotionsList(playlistData.items)}
          title={playlistData.playlist.playlist_name}
        />
        {playlistData.items.map((song) => (
          <div
            key={song.song_id}
            className="relative w-full max-w-xl p-4 pb-16 bg-black rounded-lg shadow-md"
          >
            <div className="flex flex-wrap gap-2 mb-3">
              {(song.tags ?? []).map((chip: string, index: number) => (
                <span
                  key={index}
                  className="px-2 py-1 text-xs bg-gray-200 text-gray-800 rounded-full"
                >
                  {chip}
                </span>
              ))}
            </div>
            <SongCard title={song.song} artist={song.artist} />
            <div className="absolute bottom-2 right-2 flex gap-2">
              <button
                onClick={() =>
                  onReemoveSongFromPlaylist(
                    playlistData.playlist.id,
                    song.song_id,
                    'Remove'
                  )
                }
                title="Remove from Playlist"
                className="p-2 rounded-full hover:bg-gray-200 transition-colors text-white hover:text-black"
              >
                <Delete size={20} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UserPlaylist;
