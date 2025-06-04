import { SongItem, ApiResponse, ConversationItem } from '@/types/MoodifyTypes';

const API_CONFIG = {
  MISTRAL_API_KEY: 'RXuqVFz52CqZ61kRjLWtzcMgfdoCNV3z',
};

export const fetchSongSuggestions = async (
  query: string,
  user_id: string,
): Promise<ApiResponse | null> => {
  if (!query.trim()) {
    console.error('Empty query provided to fetchSongSuggestions');
    return null;
  }

  const apiUrl = `http://56.228.4.188/api/new-song-suggester?query=${encodeURIComponent(query)}&user_id=${user_id}&k=5`;
  console.log('Making request to:', apiUrl);
    
  try {
    const response = await fetch(apiUrl);
    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));

    const responseText = await response.text();
    console.log('Raw response:', responseText);

    if (!response.ok) {
      console.error(`Error response (${response.status}):`, responseText);
      return null;
    }

    try {
      const data = JSON.parse(responseText);
      console.log('Parsed response:', data);

      // Validate response structure
      if (!data.items || !Array.isArray(data.items)) {
        console.error('Invalid response structure - missing or invalid items array:', data);
        return null;
      }

      if (!data.emotions || !Array.isArray(data.emotions)) {
        console.error('Invalid response structure - missing or invalid emotions array:', data);
        return null;
      }

      // Validate each song item has required fields
      const invalidSongs = data.items.filter((song: Partial<SongItem>) => {
        const missingFields = [];
        if (!song.song_id) missingFields.push('song_id');
        if (!song.song) missingFields.push('song');
        if (!song.artist) missingFields.push('artist');
        if (!song.genre) missingFields.push('genre');
        if (!song.tags || !Array.isArray(song.tags)) missingFields.push('tags');
        if (!song.dominants || !Array.isArray(song.dominants)) missingFields.push('dominants');
        
        if (missingFields.length > 0) {
          console.error(`Invalid song data - missing fields: ${missingFields.join(', ')}`, song);
          return true;
        }
        return false;
      });

      if (invalidSongs.length > 0) {
        console.error(`Found ${invalidSongs.length} invalid songs in response`);
        return null;
      }

      return data as ApiResponse;
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      console.error('Failed to parse response text:', responseText);
      return null;
    }
  } catch (error) {
    console.error('Network error fetching song suggestions:', error);
    return null;
  }
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
    Based on user input you will explain why these specific songs match their mood or emotional state.
    Analyze how these songs work together to help the user's emotional state.
    
    User input: ${userInput} 
    Detected emotions: ${detectedEmotions || 'N/A'}
        
    Songs to analyze:
    ${songs.map((song) => `
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
    `).join('\n')}
          
    First provide a brief overview of how these songs work together to address the user's emotional state.
    Then analyze each song individually, explaining why it was suggested.
    Keep each song's analysis under 100 words.
    Start with "Here's how these songs work together:" followed by the overview,
    then "Let's look at each song:" followed by individual analyses.
    `.trim();

  try {
    const response = await fetch(
      'https://api.mistral.ai/v1/chat/completions',
      {
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
      }
    );

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
    setConversation((prev) => prev.filter((msg) => msg.id !== loadingMessageId));
    setConversation((prev) => [...prev, { type: 'ai', content: currentResponse }]);

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