import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const targetUrl = searchParams.get('url');
    
    if (!targetUrl) {
      return new NextResponse('URL parameter is required', { status: 400 });
    }

    // Validate URL
    let parsedUrl: URL;
    try {
      parsedUrl = new URL(targetUrl);
    } catch {
      return new NextResponse('Invalid URL format', { status: 400 });
    }

    // Block dangerous protocols
    if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
      return new NextResponse('Only HTTP and HTTPS protocols are allowed', { status: 400 });
    }

    // Fetch the target URL
    const response = await fetch(targetUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
      },
      redirect: 'follow',
    });

    if (!response.ok) {
      return new NextResponse(`Failed to fetch: ${response.status} ${response.statusText}`, { 
        status: response.status 
      });
    }

    // Get the content
    const content = await response.text();
    const contentType = response.headers.get('content-type') || 'text/html';

    // If it's HTML, rewrite URLs to work with our proxy
    let processedContent = content;
    if (contentType.includes('text/html')) {
      const baseUrl = new URL(targetUrl);
      const proxyBase = `${request.nextUrl.origin}/api/proxy-fetch?url=`;
      
      // Rewrite relative URLs to absolute URLs through our proxy
      processedContent = content.replace(
        /(href|src|action)=["']([^"']+)["']/g,
        (match: string, attr: string, url: string) => {
          // Skip if it's already a full URL, data URI, or starts with #
          if (url.startsWith('http') || url.startsWith('//') || url.startsWith('#') || url.startsWith('data:')) {
            return match;
          }
          
          // Convert relative URLs to absolute
          let absoluteUrl: string;
          try {
            absoluteUrl = new URL(url, baseUrl.origin).toString();
          } catch {
            return match; // Skip if URL construction fails
          }
          
          // Return the attribute with our proxy URL
          return `${attr}="${proxyBase}${encodeURIComponent(absoluteUrl)}"`;
        }
      );

      // Also rewrite any JavaScript that might contain URLs
      processedContent = processedContent.replace(
        /(window\.location|location\.href|location\.replace|location\.assign)\s*=\s*["']([^"']+)["']/g,
        (match: string, method: string, url: string) => {
          if (url.startsWith('http') || url.startsWith('//') || url.startsWith('#')) {
            return match;
          }
          
          let absoluteUrl: string;
          try {
            absoluteUrl = new URL(url, baseUrl.origin).toString();
          } catch {
            return match;
          }
          
          return `${method} = "${proxyBase}${encodeURIComponent(absoluteUrl)}"`;
        }
      );
    }

    // Return the processed content
    return new NextResponse(processedContent, {
      status: response.status,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=3600',
        'X-Proxy-Status': 'success',
        'X-Original-URL': targetUrl,
        'X-Frame-Options': 'SAMEORIGIN',
        'X-Content-Type-Options': 'nosniff',
        'Referrer-Policy': 'strict-origin-when-cross-origin',
      },
    });

  } catch (error) {
    console.error('Proxy fetch error:', error);
    
    return new NextResponse(
      `<!DOCTYPE html>
      <html>
      <head>
        <title>Saphire Proxy Error</title>
        <style>
          body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
            margin: 0; 
            padding: 40px; 
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: #fff; 
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          .error { 
            background: rgba(255, 255, 255, 0.1); 
            backdrop-filter: blur(10px);
            padding: 30px; 
            border-radius: 16px; 
            border: 1px solid rgba(255, 255, 255, 0.2);
            max-width: 500px;
            text-align: center;
          }
          .error h1 { margin-top: 0; color: #ff6b6b; }
          .error p { opacity: 0.9; line-height: 1.6; }
        </style>
      </head>
      <body>
        <div class="error">
          <h1>🚫 Proxy Error</h1>
          <p>Failed to fetch the requested URL. This could be due to network issues, the site being down, or access restrictions.</p>
          <p><strong>Error:</strong> ${error instanceof Error ? error.message : 'Unknown error'}</p>
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
