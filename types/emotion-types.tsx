export type Emotion = {
  id: string;
  emoji: string;
  label: string;
  color: string;
};

export type ContextOption = {
  id: string;
  emoji: string;
  label: string;
  color: string;
};

export type Song = {
  id: string;
  name: string;
};

export const emotions: Emotion[] = [
  { id: 'joy', emoji: '😊', label: 'Joy', color: '#FFE299' }, // Yellow for joy
  { id: 'anger', emoji: '😡', label: 'Anger', color: '#FFAFA3' }, // Red for anger
  { id: 'sadness', emoji: '😭', label: 'Sadness', color: '#A8DAFF' }, // Blue for sadness
  { id: 'excitement', emoji: '🤩', label: 'Excitement', color: '#FFD3A8' }, // Orange-pink for excitement
  { id: 'calm', emoji: '😌', label: 'Calm', color: '#D3BDFF' }, // Light purple for calm
  { id: 'anxiety', emoji: '😖', label: 'Anxiety', color: '#A8EFBD' }, // Green for anxiety
  { id: 'boredom', emoji: '🥱', label: 'Boredom', color: '#F4EFA8' }, // Light yellow for boredom
  { id: 'confidence', emoji: '😎', label: 'Confidence', color: '#B3F4EF' }, // Teal for confidence
];

export const contextOptions: ContextOption[] = [
  { id: 'weather', emoji: '☀️', label: 'Weather', color: 'hsl(40, 100%, 50%)' },
  { id: 'music', emoji: '🎧', label: 'Music', color: 'hsl(260, 100%, 65%)' },
  {
    id: 'activity',
    emoji: '🏃',
    label: 'Activity',
    color: 'hsl(120, 100%, 40%)',
  },
  { id: 'social', emoji: '💬', label: 'Social', color: 'hsl(200, 100%, 50%)' },
  { id: 'food', emoji: '🍕', label: 'Food', color: 'hsl(10, 100%, 50%)' },
  { id: 'work', emoji: '💼', label: 'Work', color: 'hsl(280, 100%, 60%)' },
];

export const intensityPhrases: Record<number, string> = {
  0: 'None',
  10: 'Faint',
  25: 'Mild',
  50: 'Moderate',
  75: 'Intense',
  100: 'Extreme',
};

export const generateFlavorTags = (
  emotion: Emotion,
  contexts: string[],
  intensity: number
) => {
  const tags = [];

  // Tags based on emotion
  if (emotion.id === 'joy') {
    tags.push('#SunshineVibes', '#GoodDay', '#PureBliss');
    if (contexts.includes('music')) tags.push('#DanceParty', '#GoodVibesOnly');
    if (contexts.includes('food')) tags.push('#FoodieHeaven', '#TastyJoy');
  }

  if (emotion.id === 'anger') {
    tags.push('#Steamed', '#NeedSpace');
    if (contexts.includes('work')) tags.push('#OfficeRage', '#DeadlineStress');
  }

  if (emotion.id === 'excitement') {
    tags.push('#CantWait', '#Thrilled');
    if (intensity > 70) tags.push('#PumpedUp', '#OverTheMoon');
  }

  // Tags based on intensity
  if (intensity < 30) tags.push('#SubtleFeels', '#GentleMood');
  if (intensity > 70) tags.push('#BigEnergy', '#FullFeels');

  // Tags based on context combinations
  if (contexts.includes('music') && contexts.includes('social')) {
    tags.push('#PartyTime', '#SquadGoals');
  }

  if (contexts.includes('weather') && emotion.id === 'joy') {
    tags.push('#SunnyDisposition', '#BlueSkiesAhead');
  }

  // Some universal tags
  tags.push('#FeelingIt', '#Mood', '#EmotionalWeather');

  return Array.from(new Set(tags)); // Remove duplicates
};
