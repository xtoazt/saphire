import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json();
    
    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    // Validate URL
    try {
      new URL(url);
    } catch {
      return NextResponse.json({ error: 'Invalid URL format' }, { status: 400 });
    }

    // Create a proxy endpoint
    const proxyUrl = `${request.nextUrl.origin}/api/proxy-fetch?url=${encodeURIComponent(url)}`;
    
    return NextResponse.json({
      proxyUrl,
      originalUrl: url,
      message: 'Proxy URL created successfully'
    });

  } catch (error) {
    console.error('Proxy error:', error);
    return NextResponse.json(
      { error: 'Failed to create proxy URL' },
      { status: 500 }
    );
  }
}
