import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json();
    
    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    // Validate URL
    let parsedUrl: URL;
    try {
      parsedUrl = new URL(url);
    } catch {
      return NextResponse.json({ error: 'Invalid URL format' }, { status: 400 });
    }

    // Block dangerous protocols
    if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
      return NextResponse.json({ error: 'Only HTTP and HTTPS protocols are allowed' }, { status: 400 });
    }

    // Block localhost and private IPs for security
    if (parsedUrl.hostname === 'localhost' || 
        parsedUrl.hostname.startsWith('127.') || 
        parsedUrl.hostname.startsWith('192.168.') ||
        parsedUrl.hostname.startsWith('10.') ||
        parsedUrl.hostname.startsWith('172.')) {
      return NextResponse.json({ error: 'Access to local/private networks is not allowed' }, { status: 403 });
    }

    // Create a proxy endpoint
    const proxyUrl = `${request.nextUrl.origin}/api/proxy-fetch?url=${encodeURIComponent(url)}`;
    
    // Check if it's a Google service for enhanced functionality
    const isGoogleService = parsedUrl.hostname.includes('google.com') || 
                           parsedUrl.hostname.includes('googleapis.com') ||
                           parsedUrl.hostname.includes('youtube.com') ||
                           parsedUrl.hostname.includes('youtu.be');

    return NextResponse.json({
      proxyUrl,
      originalUrl: url,
      message: 'Proxy URL created successfully',
      enhanced: isGoogleService,
      location: 'Washington DC, US',
      features: [
        'URL rewriting for seamless navigation',
        'Content processing and optimization',
        'Security headers and protection',
        'Timeout handling and error recovery',
        'JavaScript navigation support'
      ],
      supportedSites: [
        'Google services (enhanced)',
        'YouTube',
        'Social media platforms',
        'News websites',
        'Educational resources',
        'And many more...'
      ]
    });

  } catch (error) {
    console.error('Proxy error:', error);
    return NextResponse.json(
      { error: 'Failed to create proxy URL' },
      { status: 500 }
    );
  }
}
