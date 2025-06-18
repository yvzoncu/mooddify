import { SongItem, ApiResponse, ConversationItem } from '@/types/MoodifyTypes';

const API_CONFIG = {
  MISTRAL_API_KEY: 'RXuqVFz52CqZ61kRjLWtzcMgfdoCNV3z',
};

const DEFAULT_SONG_VALUES = {
  genre: '',
  tempo: 0,
  danceability: 0,
  energy: 0,
  acousticness: 0,
  valence: 0,
  song_info: '',
  full_lyric: '',
  dominants: [],
  tags: [],
  spotify_id: '',
  album_image: '/images/default-album.png',
};

export const fetchSongSuggestions = async (
  query: string,
  user_id: string
): Promise<ApiResponse | null> => {
  if (!query.trim()) {
    console.error('Empty query provided to fetchSongSuggestions');
    return null;
  }

  const apiUrl = `http://56.228.4.188/api/new-song-suggester?query=${encodeURIComponent(
    query
  )}&user_id=${user_id}&k=50`;

  try {
    const response = await fetch(apiUrl);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`API Error (${response.status}):`, errorText);
      throw new Error(`API request failed with status ${response.status}`);
    }

    const data = await response.json();

    // Validate response structure
    if (!data.results || !Array.isArray(data.results)) {
      throw new Error(
        'Invalid API response structure: missing or invalid results array'
      );
    }

    // Transform the response to match expected format
    const transformedSongs: SongItem[] = data.results.map(
      (song: Partial<SongItem>) => ({
        song_id: song.song_id ?? 0,
        song: song.song ?? 'Unknown Song',
        artist: song.artist ?? 'Unknown Artist',
        ...DEFAULT_SONG_VALUES,
        ...song,
        // Ensure arrays are always arrays even if they come as null/undefined
        dominants: Array.isArray(song.dominants) ? song.dominants : [],
        tags: Array.isArray(song.tags) ? song.tags : [],
        // Ensure numbers are valid numbers
        tempo: typeof song.tempo === 'number' ? song.tempo : 0,
        danceability:
          typeof song.danceability === 'number' ? song.danceability : 0,
        energy: typeof song.energy === 'number' ? song.energy : 0,
        acousticness:
          typeof song.acousticness === 'number' ? song.acousticness : 0,
        valence: typeof song.valence === 'number' ? song.valence : 0,
        // Ensure strings are valid strings
        genre: typeof song.genre === 'string' ? song.genre : '',
        song_info: typeof song.song_info === 'string' ? song.song_info : '',
        spotify_id: typeof song.spotify_id === 'string' ? song.spotify_id : '',
        album_image:
          typeof song.album_image === 'string' && song.album_image
            ? song.album_image
            : DEFAULT_SONG_VALUES.album_image,
      })
    );

    // Generate emotions based on the average musical features of the songs
    const emotions = generateEmotionsFromSongs(transformedSongs);

    return {
      items: transformedSongs,
      emotions,
    };
  } catch (error) {
    console.error('Error in fetchSongSuggestions:', error);
    return null;
  }
};

// Helper function to generate emotions based on song features
const generateEmotionsFromSongs = (
  songs: SongItem[]
): Array<Record<string, number>> => {
  if (songs.length === 0) return [];

  // Calculate average musical features
  const avgFeatures = songs.reduce(
    (acc, song) => ({
      energy: acc.energy + song.energy,
      valence: acc.valence + song.valence,
      danceability: acc.danceability + song.danceability,
    }),
    { energy: 0, valence: 0, danceability: 0 }
  );

  const count = songs.length;
  const normalizedFeatures = {
    energy: avgFeatures.energy / count,
    valence: avgFeatures.valence / count,
    danceability: avgFeatures.danceability / count,
  };

  // Map features to emotions
  return [
    { happiness: normalizedFeatures.valence },
    { energy: normalizedFeatures.energy },
    { groove: normalizedFeatures.danceability },
  ];
};

export const processAllSongs = async (
  songs: SongItem[],
  userInput: string,
  detectedEmotions: string,
  setConversation: (
    callback: (prev: ConversationItem[]) => ConversationItem[]
  ) => void
): Promise<string[]> => {
  const loadingMessageId = 'loading-analysis';
  setConversation((prev) => [
    ...prev,
    { id: loadingMessageId, type: 'loading', content: '' },
  ]);

  const songPrompt = `
    You are a friendly song analyser AI with years of experience.
    Based on user input you will explain why these specific songs match user's emotional state or mood.
    
    User input: ${userInput} 
    Detected emotions: ${detectedEmotions || 'N/A'}
        
    Songs to analyze:
    ${songs
      .map(
        (song) => `
    Song ${song.song_id}:
    - Song: ${song.song} by ${song.artist}
    - Genre: ${song.genre}
    - Tags: ${song.tags.join(', ')}
    - Musical attributes:
      * Tempo: ${song.tempo} BPM
      * Danceability: ${song.danceability}
      * Energy: ${song.energy}
      * Acousticness: ${song.acousticness}
      * Valence: ${song.valence}
    - Song info: ${song.song_info}
    - Song Emotions: ${song.dominants
      .map((d) => {
        const emotion = Object.keys(d)[0];
        return `${emotion} (${(d[emotion] * 100).toFixed(1)}%)`;
      })
      .join(', ')}
    - Song lyric: ${song.full_lyric}
    `
      )
      .join('\n')}
          
    First provide a brief overview of how these songs work together to address the user's emotional state.
    Then analyze each song individually, explaining why it was suggested.
    Keep analysis under 100 words.
   
    `.trim();

  try {
    const response = await fetch('https://api.mistral.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${API_CONFIG.MISTRAL_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'mistral-medium',
        messages: [{ role: 'user', content: songPrompt }],
        temperature: 0.7,
        stream: true,
      }),
    });

    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    if (!response.body) throw new Error('No response body');

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let currentResponse = '';
    let buffer = '';

    while (true) {
      const { value, done } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        const trimmedLine = line.trim();
        if (!trimmedLine.startsWith('data: ')) continue;

        const data = trimmedLine.slice(6);
        if (data === '[DONE]') continue;

        try {
          const parsed = JSON.parse(data);
          const content = parsed.choices?.[0]?.delta?.content;
          if (content) {
            currentResponse += content;
            setConversation((prev) =>
              prev.map((msg) =>
                msg.id === loadingMessageId
                  ? { ...msg, type: 'ai', content: currentResponse }
                  : msg
              )
            );
          }
        } catch (error) {
          console.warn('Invalid chunk', error);
        }
      }
    }

    // Remove the loading message and add the final analysis
    setConversation((prev) =>
      prev.filter((msg) => msg.id !== loadingMessageId)
    );
    setConversation((prev) => [
      ...prev,
      { type: 'ai', content: currentResponse },
    ]);

    return [currentResponse];
  } catch (error) {
    console.error('Song processing error:', error);
    setConversation((prev) =>
      prev.map((msg) =>
        msg.id === loadingMessageId
          ? {
              ...msg,
              type: 'error',
              content: 'Sorry, I encountered an error analyzing these songs.',
            }
          : msg
      )
    );
    return [];
  }
};

export const getSelectedSongEmotionsList = (selectedSongs: SongItem[]) => {
  return selectedSongs.map((song) => song.dominants);
};
