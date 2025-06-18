// types.ts

export interface SongItem {
  song_id: number;
  song: string;
  artist: string;
  genre: string;
  tempo: number;
  danceability: number;
  energy: number;
  acousticness: number;
  valence: number;
  song_info: string;
  distance?: number;
  full_lyric?: string;
  dominants: Array<Record<string, number>>;
  tags: string[];
  onSelect?: (selected: boolean) => void;
  spotify_id?: string;
  album_image?: string;
}

export interface ConversationItem {
  id?: string;
  type: 'user' | 'ai' | 'loading' | 'song' | 'error' | 'action';
  content: string;
  song?: SongItem;
  action?: string;
}

export interface ApiResponse {
  emotions: Array<Record<string, number>>;
  items: SongItem[];
}

export const API_CONFIG = {
  MISTRAL_API_KEY: 'RXuqVFz52CqZ61kRjLWtzcMgfdoCNV3z',
};

type EmotionValue = Record<string, number>;
export type SongEmotions = EmotionValue[];

export interface PlaylistResponse {
  playlist: {
    id: number;
    user_id: string;
    playlist_name: string;
    playlist_items: Array<{ song_id: number }>;
  };
  items: SongItem[];
}

export interface BreadcrumbItem {
  label: string;
  onClick: () => void;
  isActive?: boolean;
}
