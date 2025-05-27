import { SongItem, ApiResponse, ConversationItem } from '@/types/MoodifyTypes';

const API_CONFIG = {
  MISTRAL_API_KEY: 'RXuqVFz52CqZ61kRjLWtzcMgfdoCNV3z',
};

export const fetchSongSuggestions = async (
  query: string,
  user_id: string,
): Promise<ApiResponse | null> => {
  try {
    console.log('Making request to:', `http://13.48.124.211/api/new-song-suggester?query=${encodeURIComponent(query)}&user_id=${user_id}`);
    
    const response = await fetch(
      `http://13.48.124.211/api/new-song-suggester?query=${encodeURIComponent(
        query
      )}&user_id=${user_id}&k=2`
    );

    console.log('Response status:', response.status);
    const responseText = await response.text();
    console.log('Raw response:', responseText);

    if (!response.ok) {
      console.error('Error response:', responseText);
      return null;
    }

    try {
      const data = JSON.parse(responseText);
      console.log('Parsed response:', data);
      return data as ApiResponse;
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      return null;
    }
  } catch (error) {
    console.error('Network error fetching song suggestions:', error);
    return null;
  }
};

export const processSingleSong = async (
  songItem: SongItem,
  userInput: string,
  detectedEmotions: string,
  priorAnalyses: string[],
  setConversation: (
    callback: (prev: ConversationItem[]) => ConversationItem[]
  ) => void
): Promise<string> => {
  const songMessageId = `song-${songItem.song_id}`;
  setConversation((prev) => [
    ...prev,
    { id: songMessageId, type: 'loading', content: '' },
  ]);

  const previousSongAnalyes =
    priorAnalyses.length > 0
      ? `Previously suggested songs and analysis:\n\n${priorAnalyses
          .map((a, i) => `${i + 1}. ${a}`)
          .join('\n')}\n\n`
      : '';

  const songPrompt = `
    You are a friendly song analyser AI with years of experiene.
    Based on user input you will explain why this specific song matches their mood or emotional state.
    ${
      previousSongAnalyes.length > 0
        ? 'These are your previous song anallysses based on user mood. Keep this analyse reletad and write as a continuaition'
        : ''
    }
    ${previousSongAnalyes}
    
        
    User input: ${userInput} 
    Detected emotions: ${detectedEmotions || 'N/A'}
        
    Song details:
    - Song_id: ${songItem.song_id}  
    - Song: ${songItem.song} by ${songItem.artist}
    - Genre: ${songItem.genre.join(', ')}
    - Tags: ${songItem.tags.join(', ')}
    - Song Emotions: ${songItem.dominants
      .map((d) => {
        const emotion = Object.keys(d)[0];
        return `${emotion} (${(d[emotion] * 100).toFixed(1)}%)`;
      })
      .join(', ')}
    - Song lyric: ${songItem.full_lyric}
          
    Explain why this song is suggested to the user in a friendly manner.
    Try to understand useers emotional state and how this song will help the user. 
    Use song, artist, lyrics, tags, and user's emotional state in your explanation.
    Keep it under 100 words.
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
                msg.id === songMessageId
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
    return currentResponse.trim();
  } catch (error) {
    console.error('Song processing error:', error);
    setConversation((prev) =>
      prev.map((msg) =>
        msg.id === songMessageId
          ? {
              ...msg,
              type: 'error',
              content: 'Sorry, I encountered an error analyzing this song.',
            }
          : msg
      )
    );
    return '';
  }
};

export const getSelectedSongEmotionsList = (selectedSongs: SongItem[]) => {
  return selectedSongs.map((song) => song.dominants);
}; 