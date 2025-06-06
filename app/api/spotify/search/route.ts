import { NextRequest, NextResponse } from 'next/server';

// Type definitions for Spotify API response
interface SpotifyArtist {
  name: string;
  id: string;
}

interface SpotifyTrack {
  id: string;
  name: string;
  artists: SpotifyArtist[];
}



export async function POST(request: NextRequest) {
  try {
    // Check if Spotify credentials are available
    if (!process.env.SPOTIFY_CLIENT_ID || !process.env.SPOTIFY_CLIENT_SECRET) {
      console.error('Missing Spotify credentials in environment variables');
      return NextResponse.json(
        { error: 'Spotify service unavailable' },
        { status: 500 }
      );
    }

    const { title, artist } = await request.json();
    console.log('Spotify search request:', { title, artist });

    if (!title || !artist) {
      console.error('Missing title or artist:', { title, artist });
      return NextResponse.json(
        { error: 'Title and artist are required' },
        { status: 400 }
      );
    }

    // Step 1: Get access token
    const tokenResponse = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Basic ${Buffer.from(
          `${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`
        ).toString('base64')}`,
      },
      body: 'grant_type=client_credentials',
    });

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error('Spotify token fetch error:', {
        status: tokenResponse.status,
        statusText: tokenResponse.statusText,
        error: errorText
      });
      return NextResponse.json(
        { error: 'Failed to authenticate with Spotify' },
        { status: 500 }
      );
    }

    const { access_token } = await tokenResponse.json();

    // Step 2: Search track with multiple strategies
    const searchStrategies = [
      `track:"${title}" artist:"${artist}"`,
      `"${title}" "${artist}"`,
      `${title} ${artist}`,
      title // fallback to just the title
    ];

    let track = null;
    
    for (const query of searchStrategies) {
      console.log('Trying search query:', query);
      const searchUrl = `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&limit=5`;

      const searchResponse = await fetch(searchUrl, {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      });

      if (!searchResponse.ok) {
        const errorText = await searchResponse.text();
        console.error('Spotify search error:', { query, error: errorText });
        continue; // Try next strategy
      }

      const searchData = await searchResponse.json();
      const tracks = searchData?.tracks?.items || [];
      
      if (tracks.length > 0) {
        // Try to find best match by artist name similarity with better matching
        const normalizeString = (str: string) => str.toLowerCase().trim().replace(/[^\w\s]/g, '');
        const normalizedSearchArtist = normalizeString(artist);
        
        // First try exact match
        track = tracks.find((t: SpotifyTrack) => 
          t.artists.some((a: SpotifyArtist) => normalizeString(a.name) === normalizedSearchArtist)
        );
        
        // If no exact match, try partial match but with better logic
        if (!track) {
          track = tracks.find((t: SpotifyTrack) => 
            t.artists.some((a: SpotifyArtist) => {
              const normalizedArtistName = normalizeString(a.name);
              // Check if either name contains the other (but with minimum length to avoid false positives)
              return (normalizedArtistName.includes(normalizedSearchArtist) && normalizedSearchArtist.length >= 3) ||
                     (normalizedSearchArtist.includes(normalizedArtistName) && normalizedArtistName.length >= 3);
            })
          );
        }
        
        // Final fallback to first result
        if (!track) {
          track = tracks[0];
        }
        
        console.log('Found track:', {
          name: track.name,
          artist: track.artists[0]?.name,
          query: query,
          matchType: track.artists.some((a: SpotifyArtist) => normalizeString(a.name) === normalizedSearchArtist) ? 'exact' : 'partial'
        });
        break;
      }
    }

    if (!track) {
      console.log('No track found with any search strategy');
      return NextResponse.json(
        { error: 'No matching track found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ trackId: track.id });
  } catch (error) {
    console.error('Unexpected error in /api/spotify/search:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}