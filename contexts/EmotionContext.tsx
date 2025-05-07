'use client';

const API_CONFIG = {
  MISTRAL_API_KEY: 'RXuqVFz52CqZ61kRjLWtzcMgfdoCNV3z',
};

import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  ReactNode,
} from 'react';
import { Emotion, Song, ContextOption } from '@/types/emotion-types';

interface EmotionContextType {
  selectedEmotion: Emotion | null;
  setSelectedEmotion: (emotion: Emotion | null) => void;
  hoveredEmotion: Emotion | null;
  setHoveredEmotion: (emotion: Emotion | null) => void;
  intensity: number;
  setIntensity: (intensity: number) => void;
  selectedContexts: ContextOption[];
  setSelectedContexts: (contexts: ContextOption[]) => void;
  selectedTags: string[];
  setSelectedTags: (tags: string[]) => void;
  userAddedTags: string[];
  setUserAddedTags: (tags: string[]) => void;
  newTagInput: string;
  setNewTagInput: (input: string) => void;
  toggleContext: (context: ContextOption) => void;
  toggleTag: (tag: string) => void;
  addCustomTag: () => void;
  selectedSongs: Song[];
  setSelectedSongs: React.Dispatch<React.SetStateAction<Song[]>>;
  songs: Song[];
  setSongs: React.Dispatch<React.SetStateAction<Song[]>>;
  toggleSelection: (song: Song) => void;
  fetchSongs: (moodText: string, number?: number) => void;
  loading: boolean;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
  handleContinue: () => void;
  queryEmotion: Record<string, number>;
  setQueryEmotion: React.Dispatch<React.SetStateAction<Record<string, number>>>;
}

const EmotionContext = createContext<EmotionContextType | undefined>(undefined);

export const EmotionProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [mounted, setMounted] = useState(false);
  const [selectedEmotion, setSelectedEmotion] = useState<Emotion | null>(null);
  const [intensity, setIntensity] = useState<number>(1);
  const [hoveredEmotion, setHoveredEmotion] = useState<Emotion | null>(null);
  const [selectedContexts, setSelectedContexts] = useState<ContextOption[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [userAddedTags, setUserAddedTags] = useState<string[]>([]);
  const [newTagInput, setNewTagInput] = useState('');
  const [selectedSongs, setSelectedSongs] = useState<Song[]>([]);
  const [songs, setSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(false);
  const [queryEmotion, setQueryEmotion] = useState<Record<string, number>>({});

  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleContext = (context: ContextOption) => {
    setSelectedContexts((prev: ContextOption[]) => {
      const exists = prev.includes(context);
      if (exists) {
        return prev.filter((ctx) => ctx !== context);
      } else {
        return prev.length < 3 ? [...prev, context] : prev;
      }
    });
  };

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const addCustomTag = () => {
    const trimmed = newTagInput.trim();
    if (trimmed && !userAddedTags.includes(trimmed)) {
      setUserAddedTags((prev) => [...prev, trimmed]);
      setNewTagInput('');
    }
  };

  const toggleSelection = (song: Song) => {
    setSelectedSongs((prev: Song[]) => {
      const songKey = `${song.song}-${song.artist}`;
      const exists = prev.some((s) => `${s.song}-${s.artist}` === songKey);

      if (exists) {
        // Remove the song if it's already selected
        return prev.filter((s) => `${s.song}-${s.artist}` !== songKey);
      } else {
        // Add only if fewer than 3 songs are selected
        if (prev.length < 3) {
          return [...prev, song];
        } else {
          return prev; // Do nothing if already 3 selected
        }
      }
    });
  };

  const handleContinue = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://16.171.238.151:8000/predict', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: newTagInput }),
      });

      const data = await response.json();
      setQueryEmotion(data);
    } catch (error) {
      console.error('Error sending request:', error);
    }

    await fetchSongs(newTagInput, 3);

    setLoading(false);
    setIntensity(2);
  };

  const safeJsonParse = (jsonString: string): { songs: Song[] } => {
    try {
      return JSON.parse(jsonString);
    } catch (parseError) {
      console.error('Initial JSON parsing error:', parseError);

      try {
        const cleanedJson = jsonString
          // Remove control characters
          .replace(/[\u0000-\u001F\u007F-\u009F]/g, '')
          // Fix invalid escapes like \_ => _
          .replace(/\\_/g, '_')
          // Escape lone backslashes
          .replace(/\\(?!["\\/bfnrtu])/g, '\\\\')
          // Replace newlines and tabs with space
          .replace(/[\n\r\t]/g, ' ')
          .trim();

        return JSON.parse(cleanedJson);
      } catch (secondError) {
        console.error('Cleaned JSON parse failed:', secondError);

        // Fallback regex-based extraction
        try {
          const songsData: Song[] = [];
          const songRegex =
            /"singer"\s*:\s*"([^"]+?)"\s*,\s*"song[_\\]*name"\s*:\s*"([^"]+?)"\s*,\s*"reason"\s*:\s*"([^"]+?)"/g;

          let match;
          while ((match = songRegex.exec(jsonString)) !== null) {
            songsData.push({
              artist: match[1],
              song: match[2],
              description: match[3],
              tags: match[4],
              selected: false,
            });
          }

          if (songsData.length > 0) {
            return { songs: songsData };
          }

          throw new Error('Regex match returned no results.');
        } catch (finalError) {
          console.error('All parsing methods failed:', finalError);
          throw new Error('Could not parse the API response.');
        }
      }
    }
  };

  const fetchSongs = async (moodText: string, count?: number) => {
    try {
      // 1. Create a prompt for Mistral

      const prompt = `
  You are a professional music recommendation AI.
  User is describing his/her feelings as ${moodText}
  Suggest ${count} songs that best fit for the users descrription.
  
  Searh the web and for each song, return:
  - artist: Artist name
  - title: Track title or song name
  - description: A short (max 100 words) explanation why the song is a good match and suggested to the user
  -tags: find 3 keywords from description comma seperated
  
  Return your response as **raw, valid JSON only**, in this exact format:
  {
    "songs": [
      {
        "artist": "Artist",
        "title": "Song name",
        "description": "Short explanation (max 100 words)",
        tags: "3 comma seperated keywords from description"
      }
    ]
  }
  Do not include any markdown, extra text, or formatting outside the JSON block.
  `;
      console.log(prompt);
      // 2. Get song recommendations from Mistral
      const mistralResponse = await fetch(
        'https://api.mistral.ai/v1/chat/completions',
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${API_CONFIG.MISTRAL_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'mistral-medium',
            messages: [{ role: 'user', content: prompt }],
            temperature: 0.7,
          }),
        }
      );

      const data = await mistralResponse.json();
      console.log('Mistral API Response:', data);

      // Now safely access the content
      const raw = data.choices[0].message.content;
      console.log('Raw content:', raw);

      // Extract the JSON part from the response
      const jsonMatch = raw.match(/\{[\s\S]*\}/);
      console.log('JSON match:', jsonMatch);
      if (!jsonMatch) {
        throw new Error('No valid JSON found in Mistral response');
      }

      // Use our safe JSON parser
      const parsed: { songs: Song[] } = safeJsonParse(jsonMatch[0]);
      console.log('Parsed songs:', parsed.songs);
      setSongs(parsed.songs);
    } catch (err) {
      console.error('Error fetching songs:', err);
      throw err;
    }
  };

  if (!mounted) return null;

  return (
    <EmotionContext.Provider
      value={{
        selectedEmotion,
        setSelectedEmotion,
        hoveredEmotion,
        setHoveredEmotion,
        intensity,
        setIntensity,
        selectedContexts,
        setSelectedContexts,
        selectedTags,
        setSelectedTags,
        userAddedTags,
        setUserAddedTags,
        newTagInput,
        setNewTagInput,
        toggleContext,
        toggleTag,
        addCustomTag,
        selectedSongs, // Add this line
        setSelectedSongs,
        songs,
        setSongs,
        toggleSelection,
        fetchSongs,
        loading,
        setLoading,
        handleContinue,
        queryEmotion,
        setQueryEmotion,
      }}
    >
      {children}
    </EmotionContext.Provider>
  );
};

export const useEmotion = () => {
  const context = useContext(EmotionContext);
  if (context === undefined) {
    throw new Error('useEmotion must be used within an EmotionProvider');
  }
  return context;
};
