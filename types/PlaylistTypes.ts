import { SongItem } from './MoodifyTypes';

export interface PlaylistItem {
  id: number;
  song: string;
  artist: string;
  genre: string;
  tempo: number;
  danceability: number;
  energy: number;
  valence: number;
  acousticness: number;
  release_year: number | null;
  spotify_id?: string;
  album_image?: string;
}

export interface SongDetails {
  id: number;
  song: string;
  artist: string;
  genre: string;
  tempo: number;
  danceability: number;
  energy: number;
  valence: number;
  acousticness: number;
  release_year: number;
}

export interface Playlist {
  id: number;
  playlist_name: string;
  user_id: string;
  created_at: string;
  playlist_items: PlaylistItem[];
}

export interface PlaylistData {
  playlist: {
    id: number;
    user_id: string;
    playlist_name: string;
    playlist_items: PlaylistItem[];
  };
  items: SongItem[];
} 