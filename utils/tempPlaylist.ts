import { SongItem } from '@/types/MoodifyTypes';

export const TEMP_PLAYLIST_KEY = 'moodify_temp_playlist';

export function getTempPlaylist() {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(localStorage.getItem(TEMP_PLAYLIST_KEY) || '[]');
  } catch {
    return [];
  }
}

export function setTempPlaylist(playlist: SongItem[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(TEMP_PLAYLIST_KEY, JSON.stringify(playlist));
}

export function clearTempPlaylist() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(TEMP_PLAYLIST_KEY);
}
