import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import { config } from '@/lib/config';

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json();
    
    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    // Validate URL
    let targetUrl: URL;
    try {
      targetUrl = new URL(url);
    } catch {
      return NextResponse.json({ error: 'Invalid URL format' }, { status: 400 });
    }

    // Check if it's a Google service that can use the API key
    if (targetUrl.hostname.includes('googleapis.com') || targetUrl.hostname.includes('google.com')) {
      // For Google APIs, we can enhance the request with the API key
      const enhancedUrl = new URL(targetUrl);
      enhancedUrl.searchParams.set('key', config.googleApiKey);
      
      return NextResponse.json({
        proxyUrl: enhancedUrl.toString(),
        originalUrl: url,
        enhanced: true,
        message: 'Google API request enhanced with API key'
      });
    }

    // For other URLs, create a proxy endpoint
    const proxyUrl = `${request.nextUrl.origin}/api/proxy-fetch?url=${encodeURIComponent(url)}`;
    
    return NextResponse.json({
      proxyUrl,
      originalUrl: url,
      enhanced: false,
      message: 'Proxy URL created'
    });

  } catch (error) {
    console.error('Proxy error:', error);
    return NextResponse.json(
      { error: 'Failed to create proxy URL' },
      { status: 500 }
    );
  }
}

// Handle actual proxy requests
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const targetUrl = searchParams.get('url');
    
    if (!targetUrl) {
      return NextResponse.json({ error: 'URL parameter is required' }, { status: 400 });
    }

    // Fetch the target URL
    const response = await axios.get(targetUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; AI-Web-Proxy/1.0)',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Accept-Encoding': 'gzip, deflate',
        'Connection': 'keep-alive',
      },
      timeout: 10000,
      maxRedirects: 5,
    });

    // Return the content with appropriate headers
    return new NextResponse(response.data, {
      status: response.status,
      headers: {
        'Content-Type': response.headers['content-type'] || 'text/html',
        'Cache-Control': 'public, max-age=3600',
        'X-Proxy-Status': 'success',
        'X-Original-URL': targetUrl,
      },
    });

  } catch (error) {
    console.error('Proxy fetch error:', error);
    
    if (axios.isAxiosError(error)) {
      return NextResponse.json(
        { 
          error: 'Failed to fetch URL',
          details: error.message,
          status: error.response?.status || 500
        },
        { status: error.response?.status || 500 }
      );
    }
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
