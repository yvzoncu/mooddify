'use client';

import React, {
  createContext,
  useState,
  useEffect,
  useContext,
  useMemo,
} from 'react';
import { Emotion, emotions, generateFlavorTags } from '@/types/emotion-types';

interface EmotionContextType {
  selectedEmotion: Emotion;
  setSelectedEmotion: (emotion: Emotion) => void;
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
  showConfetti: () => void;
}

export const EmotionContext = createContext<EmotionContextType | undefined>(
  undefined
);

export const EmotionProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [selectedEmotion, setSelectedEmotion] = useState<Emotion>(emotions[0]);
  const [intensity, setIntensity] = useState<number>(50);
  const [hoveredEmotion, setHoveredEmotion] = useState<Emotion | null>(null);
  const [selectedContexts, setSelectedContexts] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [userAddedTags, setUserAddedTags] = useState<string[]>([]);
  const [newTagInput, setNewTagInput] = useState('');

  // SSR-safe generation of flavorTags
  const flavorTags = useMemo(
    () => generateFlavorTags(selectedEmotion, selectedContexts, intensity),
    [selectedEmotion, selectedContexts, intensity]
  );

  const toggleContext = (id: string) => {
    setSelectedContexts((prev) =>
      prev.includes(id)
        ? prev.filter((context) => context !== id)
        : prev.length < 3
        ? [...prev, id]
        : prev
    );
  };

  const showConfetti = () => {
    if (typeof window !== 'undefined') {
      import('canvas-confetti').then((confetti) => {
        confetti.default({
          particleCount: 20,
          spread: 40,
          origin: { y: 0.6 },
          colors: [selectedEmotion.color],
        });
      });
    }
  };

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
    if (typeof window !== 'undefined') showConfetti();
  };

  const addCustomTag = () => {
    const trimmed = newTagInput.trim();
    if (trimmed && !userAddedTags.includes(trimmed)) {
      setUserAddedTags((prev) => [...prev, trimmed]);
      setNewTagInput('');
    }
  };

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
        showConfetti,
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
