import { SongItem, ApiResponse, ConversationItem } from '@/types/MoodifyTypes';

const API_CONFIG = {
  MISTRAL_API_KEY: 'RXuqVFz52CqZ61kRjLWtzcMgfdoCNV3z',
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
  )}&user_id=${user_id}&k=5`;
  console.log('Making request to:', apiUrl);

  try {
    const response = await fetch(apiUrl);
    console.log('Response status:', response.status);
    console.log(
      'Response headers:',
      Object.fromEntries(response.headers.entries())
    );

    const responseText = await response.text();
    console.log('Raw response:', responseText);

    if (!response.ok) {
      console.error(`Error response (${response.status}):`, responseText);
      return null;
    }

    try {
      const data = JSON.parse(responseText);
      console.log('Parsed response:', data);

      // Handle new API response structure
      if (!data.results || !Array.isArray(data.results)) {
        console.error(
          'Invalid response structure - missing or invalid results array:',
          data
        );
        return null;
      }

      // Transform the response to match expected format
      const transformedSongs: SongItem[] = data.results.map(
        (song: {
          song_id: number;
          song: string;
          artist: string;
          genre?: string;
          tempo?: number;
          danceability?: number;
          energy?: number;
          acousticness?: number;
          valence?: number;
          song_info?: string;
          distance?: number;
          spotify_id?: string;
          album_image?: string;
        }) => ({
          song_id: song.song_id,
          song: song.song,
          artist: song.artist,
          genre: song.genre || '',
          tempo: song.tempo || 0,
          danceability: song.danceability || 0,
          energy: song.energy || 0,
          acousticness: song.acousticness || 0,
          valence: song.valence || 0,
          song_info: song.song_info || '',
          distance: song.distance,
          full_lyric: '',
          dominants: [], // Default empty array since not provided by new API
          tags: [], // Default empty array since not provided by new API
          spotify_id: song.spotify_id,
          album_image: song.album_image,
        })
      );

      // Create mock emotions data since new API doesn't provide it
      const mockEmotions: Array<Record<string, number>> = [
        { love: 0.7 },
        { happiness: 0.6 },
        { nostalgia: 0.5 },
      ];

      const transformedResponse: ApiResponse = {
        items: transformedSongs,
        emotions: mockEmotions,
      };

      console.log('Transformed response:', transformedResponse);
      return transformedResponse;
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
