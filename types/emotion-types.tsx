export type Song = {
  song: string;
  artist: string;
  description?: string;
  tags?: string | null;
  final_score?: string | null;
  selected: boolean;

  onSelect?: (selected: boolean) => void;
};

export type ContextOption = {
  id: string;
  emoji: string;
  label: string;
  color?: string;
  info?: string;
};

export type Emotion = {
  id: string;
  emoji: string;
  label: string;
  color: string;
  text_color: string;
  intensity?: string;
  valence: 'positive' | 'negative';
  context: ContextOption[];
};

const contextOptions: { [key: string]: ContextOption[] } = {
  positive: [
    {
      id: 'amusement',
      emoji: '😂',
      label: 'Amused',
      color: '#FFD700',
      info: 'A feeling of joy and entertainment, often from humor.',
    },
    {
      id: 'excitement',
      emoji: '🎉',
      label: 'Excited',
      color: '#FF6347',
      info: 'A state of enthusiasm and eagerness, often anticipatory.',
    },
    {
      id: 'joy',
      emoji: '😊',
      label: 'Joyful',
      color: '#FFD700',
      info: 'A feeling of great pleasure and happiness, often from success.',
    },
    {
      id: 'gratitude',
      emoji: '🙏',
      label: 'Gratitude',
      color: '#7CFC00',
      info: 'A feeling of appreciation and thankfulness for what one has.',
    },
    {
      id: 'pride',
      emoji: '🏆',
      label: 'Pride',
      color: '#FF4500',
      info: 'A feeling of deep pleasure or satisfaction from achievements.',
    },
    {
      id: 'optimism',
      emoji: '🌞',
      label: 'Optimist',
      color: '#FFD700',
      info: 'A hopeful and confident outlook on the future.',
    },
    {
      id: 'admiration',
      emoji: '👏',
      label: 'Admired',
      color: '#1E90FF',
      info: 'A feeling of respect and approval for someone or something.',
    },
    {
      id: 'approval',
      emoji: '👍',
      label: 'Approve',
      color: '#32CD32',
      info: 'A feeling of acceptance and endorsement of something.',
    },
    {
      id: 'love',
      emoji: '❤️',
      label: 'Love',
      color: '#FF69B4',
      info: 'A deep affection and care for someone or something.',
    },
    {
      id: 'relief',
      emoji: '😌',
      label: 'Reliefed',
      color: '#7CFC00',
      info: 'A feeling of reassurance and relaxation after anxiety.',
    },
    {
      id: 'curiosity',
      emoji: '🤔',
      label: 'Curios',
      color: '#8A2BE2',
      info: 'A strong desire to know or learn something new.',
    },
    {
      id: 'realization',
      emoji: '💡',
      label: 'Realized',
      color: '#FFD700',
      info: 'A moment of sudden understanding or comprehension.',
    },
    {
      id: 'caring',
      emoji: '🤗',
      label: 'Caring',
      color: '#FF69B4',
      info: 'A feeling of concern and kindness towards others.',
    },
    {
      id: 'neutral',
      emoji: '😐',
      label: 'Neutral',
      color: '#A9A9A9',
      info: 'A state of being impartial and unbiased, neither positive nor negative.',
    },
    {
      id: 'surprise',
      emoji: '😮',
      label: 'Surprise',
      color: '#FFD700',
      info: 'A feeling of astonishment or wonder from something unexpected.',
    },
  ],
  negative: [
    {
      id: 'anger',
      emoji: '😡',
      label: 'Angy',
      color: '#FF4500',
      info: 'A strong feeling of annoyance, displeasure, or hostility.',
    },
    {
      id: 'annoyance',
      emoji: '😤',
      label: 'Annoyed',
      color: '#FF4500',
      info: 'A feeling of irritation or frustration from something unpleasant.',
    },
    {
      id: 'disapproval',
      emoji: '👎',
      label: 'Disapproved',
      color: '#FF4500',
      info: 'A feeling of discontent or disagreement with something.',
    },
    {
      id: 'disgust',
      emoji: '🤢',
      label: 'Disgust',
      color: '#800080',
      info: 'A feeling of revulsion or strong dislike caused by something unpleasant.',
    },
    {
      id: 'sadness',
      emoji: '😢',
      label: 'Sad',
      color: '#1E90FF',
      info: 'A feeling of unhappiness or grief, often from loss or disappointment.',
    },
    {
      id: 'grief',
      emoji: '😭',
      label: 'Grief',
      color: '#1E90FF',
      info: 'A deep sorrow and pain, often from the loss of a loved one.',
    },
    {
      id: 'disappointment',
      emoji: '😔',
      label: 'Disappointment',
      color: '#1E90FF',
      info: 'A feeling of dissatisfaction from failed expectations or hopes.',
    },
    {
      id: 'remorse',
      emoji: '😢',
      label: 'Remorsed',
      color: '#1E90FF',
      info: 'A deep regret or guilt for past actions or failures.',
    },
    {
      id: 'fear',
      emoji: '😨',
      label: 'Fear',
      color: '#000000',
      info: 'A feeling of anxiety and alarm caused by the presence of danger.',
    },
    {
      id: 'nervousness',
      emoji: '😰',
      label: 'Nervous',
      color: '#FFFF00',
      info: 'A feeling of anxiety and tension, often from uncertainty or stress.',
    },
    {
      id: 'confusion',
      emoji: '😕',
      label: 'Confused',
      color: '#8A2BE2',
      info: 'A state of bewilderment or lack of understanding about something.',
    },
    {
      id: 'embarrassment',
      emoji: '😳',
      label: 'Embarrassed',
      color: '#FF69B4',
      info: 'A feeling of self-consciousness and discomfort from social mistakes.',
    },
  ],
};

export const emotions: Emotion[] = [
  {
    id: 'happy',
    emoji: '😊',
    label: 'Happy',
    color: '#FFD700', // Gold represents joy and happiness.
    text_color: '#1F2937',
    valence: 'positive',
    context: contextOptions.positive,
  },
  {
    id: 'curious',
    emoji: '🤔',
    label: 'Curious',
    color: '#8A2BE2', // Purple represents curiosity and intrigue.
    text_color: '#FFFFFF',
    valence: 'positive',
    context: contextOptions.positive.filter(
      (option) =>
        option.id === 'curiosity' ||
        option.id === 'realization' ||
        option.id === 'optimism'
    ),
  },
  {
    id: 'neutral',
    emoji: '😐',
    label: 'Neutral',
    color: '#A9A9A9', // Gray represents neutrality and balance.
    text_color: '#1F2937',
    valence: 'positive',
    context: contextOptions.positive.filter(
      (option) => option.id === 'neutral' || option.id === 'surprise'
    ),
  },
  {
    id: 'calm',
    emoji: '😌',
    label: 'Calm',
    color: '#7CFC00', // Light green represents calmness and relaxation.
    text_color: '#1F2937',
    valence: 'positive',
    context: contextOptions.positive.filter(
      (option) =>
        option.id === 'relief' ||
        option.id === 'approval' ||
        option.id === 'caring'
    ),
  },
  {
    id: 'social',
    emoji: '🤝',
    label: 'Social',
    color: '#1E90FF', // Blue represents trust and stability, fitting for social emotions.
    text_color: '#FFFFFF',
    valence: 'positive',
    context: contextOptions.positive.filter(
      (option) =>
        option.id === 'admiration' ||
        option.id === 'approval' ||
        option.id === 'love' ||
        option.id === 'gratitude' ||
        option.id === 'pride'
    ),
  },
  {
    id: 'energetic',
    emoji: '🏃‍♂️',
    label: 'Energetic',
    color: '#FF6347', // Tomato red represents energy and enthusiasm.
    text_color: '#1F2937',
    valence: 'negative',
    context: contextOptions.negative.filter(
      (option) =>
        option.id === 'excitement' ||
        option.id === 'fear' ||
        option.id === 'surprise' ||
        option.id === 'nervousness'
    ),
  },
  {
    id: 'unhappy',
    emoji: '😢',
    label: 'Unhappy',
    color: '#1E90FF', // Dodger blue represents unhappiness and grief.
    text_color: '#FFFFFF',
    valence: 'negative',
    context: contextOptions.negative,
  },
  {
    id: 'reflective',
    emoji: '😔',
    label: 'Reflective',
    color: '#8B008B', // Dark magenta represents deep regret and guilt.
    text_color: '#FFFFFF',
    valence: 'negative',
    context: contextOptions.negative.filter(
      (option) =>
        option.id === 'remorse' ||
        option.id === 'disappointment' ||
        option.id === 'grief' ||
        option.id === 'sadness'
    ),
  },
];

export const intensityPhrases: Record<number, string> = {
  0: 'None',
  10: 'Faint',
  25: 'Mild',
  50: 'Moderate',
  75: 'Intense',
  100: 'Extreme',
};

export const userEmotions: ContextOption[] = [
  {
    id: 'amusement',
    emoji: '😂',
    label: 'Amused',
    color: '#FFD700',
    info: 'A feeling of joy and entertainment, often from humor.',
  },
  {
    id: 'excitement',
    emoji: '🎉',
    label: 'Excited',
    color: '#FF6347',
    info: 'A state of enthusiasm and eagerness, often anticipatory.',
  },
  {
    id: 'joy',
    emoji: '😊',
    label: 'Joyful',
    color: '#FFD700',
    info: 'A feeling of great pleasure and happiness, often from success.',
  },
  {
    id: 'gratitude',
    emoji: '🙏',
    label: 'Gratitude',
    color: '#7CFC00',
    info: 'A feeling of appreciation and thankfulness for what one has.',
  },
  {
    id: 'pride',
    emoji: '🏆',
    label: 'Pride',
    color: '#FF4500',
    info: 'A feeling of deep pleasure or satisfaction from achievements.',
  },
  {
    id: 'optimism',
    emoji: '🌞',
    label: 'Optimist',
    color: '#FFD700',
    info: 'A hopeful and confident outlook on the future.',
  },
  {
    id: 'admiration',
    emoji: '👏',
    label: 'Admired',
    color: '#1E90FF',
    info: 'A feeling of respect and approval for someone or something.',
  },
  {
    id: 'approval',
    emoji: '👍',
    label: 'Approve',
    color: '#32CD32',
    info: 'A feeling of acceptance and endorsement of something.',
  },
  {
    id: 'love',
    emoji: '❤️',
    label: 'Love',
    color: '#FF69B4',
    info: 'A deep affection and care for someone or something.',
  },
  {
    id: 'relief',
    emoji: '😌',
    label: 'Reliefed',
    color: '#7CFC00',
    info: 'A feeling of reassurance and relaxation after anxiety.',
  },
  {
    id: 'curiosity',
    emoji: '🤔',
    label: 'Curios',
    color: '#8A2BE2',
    info: 'A strong desire to know or learn something new.',
  },
  {
    id: 'realization',
    emoji: '💡',
    label: 'Realized',
    color: '#FFD700',
    info: 'A moment of sudden understanding or comprehension.',
  },
  {
    id: 'caring',
    emoji: '🤗',
    label: 'Caring',
    color: '#FF69B4',
    info: 'A feeling of concern and kindness towards others.',
  },
  {
    id: 'neutral',
    emoji: '😐',
    label: 'Neutral',
    color: '#A9A9A9',
    info: 'A state of being impartial and unbiased, neither positive nor negative.',
  },
  {
    id: 'surprise',
    emoji: '😮',
    label: 'Surprise',
    color: '#FFD700',
    info: 'A feeling of astonishment or wonder from something unexpected.',
  },
  {
    id: 'anger',
    emoji: '😡',
    label: 'Angy',
    color: '#FF4500',
    info: 'A strong feeling of annoyance, displeasure, or hostility.',
  },
  {
    id: 'annoyance',
    emoji: '😤',
    label: 'Annoyed',
    color: '#FF4500',
    info: 'A feeling of irritation or frustration from something unpleasant.',
  },
  {
    id: 'disapproval',
    emoji: '👎',
    label: 'Disapproved',
    color: '#FF4500',
    info: 'A feeling of discontent or disagreement with something.',
  },
  {
    id: 'disgust',
    emoji: '🤢',
    label: 'Disgust',
    color: '#800080',
    info: 'A feeling of revulsion or strong dislike caused by something unpleasant.',
  },
  {
    id: 'sadness',
    emoji: '😢',
    label: 'Sad',
    color: '#1E90FF',
    info: 'A feeling of unhappiness or grief, often from loss or disappointment.',
  },
  {
    id: 'grief',
    emoji: '😭',
    label: 'Grief',
    color: '#1E90FF',
    info: 'A deep sorrow and pain, often from the loss of a loved one.',
  },
  {
    id: 'disappointment',
    emoji: '😔',
    label: 'Disappointment',
    color: '#1E90FF',
    info: 'A feeling of dissatisfaction from failed expectations or hopes.',
  },
  {
    id: 'remorse',
    emoji: '😢',
    label: 'Remorsed',
    color: '#1E90FF',
    info: 'A deep regret or guilt for past actions or failures.',
  },
  {
    id: 'fear',
    emoji: '😨',
    label: 'Fear',
    color: '#000000',
    info: 'A feeling of anxiety and alarm caused by the presence of danger.',
  },
  {
    id: 'nervousness',
    emoji: '😰',
    label: 'Nervous',
    color: '#FFFF00',
    info: 'A feeling of anxiety and tension, often from uncertainty or stress.',
  },
  {
    id: 'confusion',
    emoji: '😕',
    label: 'Confused',
    color: '#8A2BE2',
    info: 'A state of bewilderment or lack of understanding about something.',
  },
  {
    id: 'embarrassment',
    emoji: '😳',
    label: 'Embarrassed',
    color: '#FF69B4',
    info: 'A feeling of self-consciousness and discomfort from social mistakes.',
  },
];
