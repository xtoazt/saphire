import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { url, serverLocation = 'washington-dc' } = await request.json();
    
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

    // Server location mapping
    const serverLocations: Record<string, { name: string; country: string; flag: string; features: string[] }> = {
      'washington-dc': { name: 'Washington DC', country: 'United States', flag: '🇺🇸', features: ['Google Services Enhanced', 'High Speed', 'Government Grade'] },
      'london': { name: 'London', country: 'United Kingdom', flag: '🇬🇧', features: ['EU Compliance', 'Fast CDN', 'Privacy Focused'] },
      'singapore': { name: 'Singapore', country: 'Singapore', flag: '🇸🇬', features: ['Asia Pacific', 'Ultra Low Latency', '24/7 Support'] },
      'tokyo': { name: 'Tokyo', country: 'Japan', flag: '🇯🇵', features: ['Japanese Sites', 'High Bandwidth', 'Gaming Optimized'] },
      'frankfurt': { name: 'Frankfurt', country: 'Germany', flag: '🇩🇪', features: ['GDPR Compliant', 'European Hub', 'Secure'] },
      'sydney': { name: 'Sydney', country: 'Australia', flag: '🇦🇺', features: ['Oceania Coverage', 'Fast Streaming', 'Local Content'] },
      'toronto': { name: 'Toronto', country: 'Canada', flag: '🇨🇦', features: ['North America', 'Privacy Laws', 'High Reliability'] },
      'mumbai': { name: 'Mumbai', country: 'India', flag: '🇮🇳', features: ['South Asia', 'Local Services', 'Cost Effective'] }
    };

    const selectedServer = serverLocations[serverLocation] || serverLocations['washington-dc'];
    
    // Create a proxy endpoint with server location
    const proxyUrl = `${request.nextUrl.origin}/api/proxy-fetch?url=${encodeURIComponent(url)}&server=${serverLocation}`;
    
    // Check if it's a Google service for enhanced functionality
    const isGoogleService = parsedUrl.hostname.includes('google.com') || 
                           parsedUrl.hostname.includes('googleapis.com') ||
                           parsedUrl.hostname.includes('youtube.com') ||
                           parsedUrl.hostname.includes('youtu.be');

           return NextResponse.json({
             proxyUrl,
             originalUrl: url,
             message: 'Cloud machine proxy URL created successfully',
             enhanced: isGoogleService,
             location: `${selectedServer.name}, ${selectedServer.country}`,
             serverLocation: selectedServer,
             features: [
               'Windows 10 64-bit processing',
               'Full JavaScript execution',
               'Real-time content rendering',
               'Enhanced security protocols',
               'Cloud machine optimization',
               ...selectedServer.features
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
