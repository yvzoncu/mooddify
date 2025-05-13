export type Song = {
  spotifyId?: string;
  name: string;
  artist: string;
  description?: string;
  tags?: string | null;
  final_score?: string | null;
  selected?: boolean;

  onSelect?: (selected: boolean) => void;
};
