import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

// Enable edge runtime for better performance
export const runtime = 'edge';
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const targetUrl = searchParams.get('url');
    
    if (!targetUrl) {
      return NextResponse.json({ error: 'URL parameter is required' }, { status: 400 });
    }

    // Validate URL
    try {
      new URL(targetUrl);
    } catch {
      return NextResponse.json({ error: 'Invalid URL format' }, { status: 400 });
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
      timeout: 15000,
      maxRedirects: 5,
      validateStatus: (status) => status < 500, // Accept all status codes < 500
    });

    // Process the content to make it work within our proxy
    let content = response.data;
    
    // If it's HTML, we need to rewrite URLs to go through our proxy
    if (response.headers['content-type']?.includes('text/html')) {
      content = content.replace(
        /(href|src|action)=["']([^"']+)["']/g,
        (match: string, attr: string, url: string) => {
          // Skip if it's already a full URL or starts with #
          if (url.startsWith('http') || url.startsWith('//') || url.startsWith('#')) {
            return match;
          }
          
          // Convert relative URLs to absolute
          const baseUrl = new URL(targetUrl);
          const absoluteUrl = new URL(url, baseUrl.origin).toString();
          
          // Return the attribute with our proxy URL
          return `${attr}="/api/proxy-fetch?url=${encodeURIComponent(absoluteUrl)}"`;
        }
      );
    }

    // Return the content with appropriate headers
    return new NextResponse(content, {
      status: response.status,
      headers: {
        'Content-Type': response.headers['content-type'] || 'text/html',
        'Cache-Control': 'public, max-age=3600',
        'X-Proxy-Status': 'success',
        'X-Original-URL': targetUrl,
        'X-Frame-Options': 'SAMEORIGIN',
        'X-Content-Type-Options': 'nosniff',
      },
    });

  } catch (error) {
    console.error('Proxy fetch error:', error);
    
    if (axios.isAxiosError(error)) {
      const status = error.response?.status || 500;
      const errorMessage = error.response?.data || error.message;
      
      return new NextResponse(
        `<!DOCTYPE html>
        <html>
        <head>
          <title>Proxy Error</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 40px; background: #1a1a1a; color: #fff; }
            .error { background: #2a2a2a; padding: 20px; border-radius: 8px; border-left: 4px solid #ff6b6b; }
            .code { background: #333; padding: 10px; border-radius: 4px; margin: 10px 0; }
          </style>
        </head>
        <body>
          <div class="error">
            <h2>Proxy Error</h2>
            <p>Failed to fetch the requested URL.</p>
            <div class="code">Status: ${status}</div>
            <div class="code">Error: ${errorMessage}</div>
          </div>
        </body>
        </html>`,
        {
          status,
          headers: {
            'Content-Type': 'text/html',
            'X-Proxy-Status': 'error',
          },
        }
      );
    }
    
    return new NextResponse(
      `<!DOCTYPE html>
      <html>
      <head>
        <title>Proxy Error</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 40px; background: #1a1a1a; color: #fff; }
          .error { background: #2a2a2a; padding: 20px; border-radius: 8px; border-left: 4px solid #ff6b6b; }
        </style>
      </head>
      <body>
        <div class="error">
          <h2>Internal Server Error</h2>
          <p>An unexpected error occurred while processing your request.</p>
        </div>
      </body>
      </html>`,
      {
        status: 500,
        headers: {
          'Content-Type': 'text/html',
          'X-Proxy-Status': 'error',
        },
      }
    );
  }
}
