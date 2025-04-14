'use client';

import React, {
  createContext,
  useState,
  useContext,
  useMemo,
  useEffect,
  ReactNode,
} from 'react';
import { Emotion, generateFlavorTags, Song } from '@/types/emotion-types';

interface EmotionContextType {
  selectedEmotion: Emotion | null;
  setSelectedEmotion: (emotion: Emotion | null) => void;
  hoveredEmotion: Emotion | null;
  setHoveredEmotion: (emotion: Emotion | null) => void;
  intensity: number;
  setIntensity: (intensity: number) => void;
  selectedContexts: string[];
  setSelectedContexts: (contexts: string[]) => void;
  flavorTags: string[];
  selectedTags: string[];
  setSelectedTags: (tags: string[]) => void;
  userAddedTags: string[];
  setUserAddedTags: (tags: string[]) => void;
  newTagInput: string;
  setNewTagInput: (input: string) => void;
  toggleContext: (id: string) => void;
  toggleTag: (tag: string) => void;
  addCustomTag: () => void;
  selectedSongs: (string | null | undefined)[];
  setSelectedSongs: React.Dispatch<
    React.SetStateAction<(string | null | undefined)[]>
  >;
}

const EmotionContext = createContext<EmotionContextType | undefined>(undefined);

export const EmotionProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [mounted, setMounted] = useState(false);
  const [selectedEmotion, setSelectedEmotion] = useState<Emotion | null>(null);
  const [intensity, setIntensity] = useState<number>(50);
  const [hoveredEmotion, setHoveredEmotion] = useState<Emotion | null>(null);
  const [selectedContexts, setSelectedContexts] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [userAddedTags, setUserAddedTags] = useState<string[]>([]);
  const [newTagInput, setNewTagInput] = useState('');
  const [selectedSongs, setSelectedSongs] = useState<
    (string | null | undefined)[]
  >([]);

  useEffect(() => {
    setMounted(true);
  }, []);

  const flavorTags = useMemo(() => {
    if (!selectedEmotion) return [];
    return generateFlavorTags(selectedEmotion, selectedContexts, intensity);
  }, [selectedEmotion, selectedContexts, intensity]);

  const toggleContext = (id: string) => {
    setSelectedContexts((prev) =>
      prev.includes(id)
        ? prev.filter((context) => context !== id)
        : prev.length < 3
        ? [...prev, id]
        : prev
    );
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
        flavorTags,
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

export const revealSongsOneByOne = async (
  newSongs: Song[],
  setSongs: React.Dispatch<React.SetStateAction<Song[]>>,
  setButtonText: (text: string) => void
) => {
  setSongs([]);
  for (let i = 0; i < newSongs.length; i++) {
    await new Promise((res) => setTimeout(res, 300));
    setSongs((prev) => [...prev, newSongs[i]]);
  }
  setButtonText('Get New Recommendations');
};
