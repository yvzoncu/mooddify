import { NextRequest, NextResponse } from 'next/server';


const SPOTIFY_CLIENT_ID = '8bf6cef1e2a24f9883431685c9861335';
const SPOTIFY_CLIENT_SECRET = '922fa04dd1274dbda39117e6aee66b70';

export async function POST(request: NextRequest) {
  try {
    const { title, artist } = await request.json();

    if (!title || !artist) {
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
          `${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`
        ).toString('base64')}`,
      },
      body: 'grant_type=client_credentials',
    });

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error('Spotify token fetch error:', errorText);
      return NextResponse.json(
        { error: 'Failed to authenticate with Spotify' },
        { status: 500 }
      );
    }

    const { access_token } = await tokenResponse.json();

    // Step 2: Search track
    const query = `track:${title} artist:${artist}`;
    const searchUrl = `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&limit=1`;

    const searchResponse = await fetch(searchUrl, {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    });

    if (!searchResponse.ok) {
      const errorText = await searchResponse.text();
      console.error('Spotify search error:', errorText);
      return NextResponse.json(
        { error: 'Failed to search Spotify' },
        { status: 500 }
      );
    }

    const searchData = await searchResponse.json();
    const track = searchData?.tracks?.items?.[0];

    if (!track) {
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