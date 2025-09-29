import { NextRequest, NextResponse } from 'next/server';

// Enhanced proxy with better functionality
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

    // Block dangerous protocols and localhost
    if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
      return new NextResponse('Only HTTP and HTTPS protocols are allowed', { status: 400 });
    }

    // Block localhost and private IPs for security
    if (parsedUrl.hostname === 'localhost' || 
        parsedUrl.hostname.startsWith('127.') || 
        parsedUrl.hostname.startsWith('192.168.') ||
        parsedUrl.hostname.startsWith('10.') ||
        parsedUrl.hostname.startsWith('172.')) {
      return new NextResponse('Access to local/private networks is not allowed', { status: 403 });
    }

    // Default server info
    const selectedServer = { name: 'Saphire Server', country: 'United States', flag: '🇺🇸' };

    // Enhanced headers for better compatibility
    const headers: HeadersInit = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
      'Accept-Language': 'en-US,en;q=0.9',
      'Accept-Encoding': 'gzip, deflate, br',
      'Connection': 'keep-alive',
      'Upgrade-Insecure-Requests': '1',
      'Sec-Fetch-Dest': 'document',
      'Sec-Fetch-Mode': 'navigate',
      'Sec-Fetch-Site': 'none',
      'Sec-Fetch-User': '?1',
      'Cache-Control': 'no-cache',
    };

    // Add referer for better compatibility
    if (parsedUrl.hostname) {
      headers['Referer'] = `${parsedUrl.protocol}//${parsedUrl.hostname}/`;
    }

    // Fetch the target URL with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

    const response = await fetch(targetUrl, {
      headers,
      redirect: 'follow',
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

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
      
      // More comprehensive URL rewriting
      processedContent = content
        // Rewrite href, src, action attributes
        .replace(
          /(href|src|action)=["']([^"']+)["']/g,
          (match: string, attr: string, url: string) => {
            if (url.startsWith('http') || url.startsWith('//') || url.startsWith('#') || url.startsWith('data:') || url.startsWith('javascript:')) {
              return match;
            }
            
            try {
              const absoluteUrl = new URL(url, baseUrl.origin).toString();
              return `${attr}="${proxyBase}${encodeURIComponent(absoluteUrl)}"`;
            } catch {
              return match;
            }
          }
        )
        // Rewrite CSS url() functions
        .replace(
          /url\(["']?([^"')]+)["']?\)/g,
          (match: string, url: string) => {
            if (url.startsWith('http') || url.startsWith('//') || url.startsWith('data:')) {
              return match;
            }
            
            try {
              const absoluteUrl = new URL(url, baseUrl.origin).toString();
              return `url("${proxyBase}${encodeURIComponent(absoluteUrl)}")`;
            } catch {
              return match;
            }
          }
        )
        // Rewrite JavaScript location assignments
        .replace(
          /(window\.location|location\.href|location\.replace|location\.assign)\s*=\s*["']([^"']+)["']/g,
          (match: string, method: string, url: string) => {
            if (url.startsWith('http') || url.startsWith('//') || url.startsWith('#')) {
              return match;
            }
            
            try {
              const absoluteUrl = new URL(url, baseUrl.origin).toString();
              return `${method} = "${proxyBase}${encodeURIComponent(absoluteUrl)}"`;
            } catch {
              return match;
            }
          }
        )
        // Rewrite form actions
        .replace(
          /<form([^>]*?)action=["']([^"']+)["']([^>]*?)>/g,
          (match: string, before: string, action: string, after: string) => {
            if (action.startsWith('http') || action.startsWith('//') || action.startsWith('#')) {
              return match;
            }
            
            try {
              const absoluteUrl = new URL(action, baseUrl.origin).toString();
              return `<form${before}action="${proxyBase}${encodeURIComponent(absoluteUrl)}"${after}>`;
            } catch {
              return match;
            }
          }
        );

      // Add a base tag to help with relative URLs
      if (!processedContent.includes('<base')) {
        processedContent = processedContent.replace(
          /<head([^>]*)>/i,
          `<head$1><base href="${baseUrl.origin}/">`
        );
      }

      // Add enhanced undetectable proxy navigation script
      const proxyScript = `
        <script>
          // Enhanced undetectable proxy navigation
          (function() {
            const proxyBase = '${proxyBase}';

            // Only handle external links that would leave the proxy
            document.addEventListener('click', function(e) {
              const target = e.target.closest('a');
              if (target && target.href && !target.href.includes(proxyBase.split('/api/')[0])) {
                // Only proxy external links, let internal navigation work normally
                if (target.href.startsWith('http') && !target.href.includes(window.location.hostname)) {
                  e.preventDefault();
                  const proxyUrl = proxyBase + encodeURIComponent(target.href);
                  window.location.href = proxyUrl;
                }
              }
            }, true);

          })();
        </script>
      `;

      // Insert the script before closing head tag
      processedContent = processedContent.replace('</head>', `${proxyScript}</head>`);
    }

    // Return the processed content with enhanced headers
    return new NextResponse(processedContent, {
      status: response.status,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=1800', // 30 minutes cache
        'X-Proxy-Status': 'success',
        'X-Original-URL': targetUrl,
        'X-Proxy-Location': `${selectedServer.name}, ${selectedServer.country}`,
        'X-Proxy-Server': 'saphire',
        'X-Frame-Options': 'SAMEORIGIN',
        'X-Content-Type-Options': 'nosniff',
        'Referrer-Policy': 'strict-origin-when-cross-origin',
        'Permissions-Policy': 'geolocation=(), microphone=(), camera=()',
      },
    });

  } catch (error) {
    console.error('Proxy fetch error:', error);
    
    const isTimeout = error instanceof Error && error.name === 'AbortError';
    const errorMessage = isTimeout ? 'Request timeout' : (error instanceof Error ? error.message : 'Unknown error');
    
    // Default server info for error response
    const selectedServer = { name: 'Saphire Server', country: 'United States', flag: '🇺🇸' };
    
    return new NextResponse(
      `<!DOCTYPE html>
      <html>
      <head>
        <title>Saphire Proxy Error</title>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
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
          .error .location { 
            background: rgba(255, 255, 255, 0.1); 
            padding: 10px; 
            border-radius: 8px; 
            margin-top: 20px; 
            font-size: 0.9em;
          }
        </style>
      </head>
      <body>
        <div class="error">
          <h1>🚫 Proxy Error</h1>
          <p>Failed to fetch the requested URL. This could be due to network issues, the site being down, or access restrictions.</p>
          <p><strong>Error:</strong> ${errorMessage}</p>
          <div class="location">
            <strong>📍 Proxy Location:</strong> ${selectedServer.name}, ${selectedServer.country}
          </div>
        </div>
      </body>
      </html>`,
      {
        status: 500,
        headers: {
          'Content-Type': 'text/html',
          'X-Proxy-Status': 'error',
          'X-Proxy-Location': `${selectedServer.name}, ${selectedServer.country}`,
        },
      }
    );
  }
}
