export interface ServerConfig {
  id: string;
  name: string;
  city: string;
  country: string;
  flag: string;
  latency: string;
  status: 'online' | 'offline' | 'maintenance';
  features: string[];
  endpoint: string;
  healthCheck: string;
  region: string;
}

export const REAL_SERVERS: ServerConfig[] = [
  {
    id: 'washington-dc',
    name: 'Washington DC',
    city: 'Washington DC',
    country: 'United States',
    flag: '🇺🇸',
    latency: '12ms',
    status: 'online',
    features: ['Windows 10 64-bit', 'Google Services Enhanced', 'High Speed', 'Government Grade'],
    endpoint: 'https://proxy-us-east.saphire.dev',
    healthCheck: 'https://proxy-us-east.saphire.dev/health',
    region: 'us-east'
  },
  {
    id: 'allorigins',
    name: 'AllOrigins',
    city: 'Global',
    country: 'Worldwide',
    flag: '🌍',
    latency: '25ms',
    status: 'online',
    features: ['Windows 10 64-bit', 'CORS Proxy', 'Reliable', 'Fast'],
    endpoint: 'https://api.allorigins.win/raw',
    healthCheck: 'https://api.allorigins.win/raw?url=https://httpbin.org/status/200',
    region: 'global'
  },
  {
    id: 'cors-anywhere',
    name: 'CORS Anywhere',
    city: 'Global',
    country: 'Worldwide',
    flag: '🌍',
    latency: '30ms',
    status: 'online',
    features: ['Windows 10 64-bit', 'CORS Proxy', 'Stable', 'Wide Support'],
    endpoint: 'https://cors-anywhere.herokuapp.com',
    healthCheck: 'https://cors-anywhere.herokuapp.com/https://httpbin.org/status/200',
    region: 'global'
  },
  {
    id: 'thingproxy',
    name: 'ThingProxy',
    city: 'Global',
    country: 'Worldwide',
    flag: '🌍',
    latency: '35ms',
    status: 'online',
    features: ['Windows 10 64-bit', 'Free Proxy', 'Reliable', 'Fast Response'],
    endpoint: 'https://thingproxy.freeboard.io/fetch',
    healthCheck: 'https://thingproxy.freeboard.io/fetch/https://httpbin.org/status/200',
    region: 'global'
  },
  {
    id: 'proxy-cors',
    name: 'Proxy CORS',
    city: 'Global',
    country: 'Worldwide',
    flag: '🌍',
    latency: '28ms',
    status: 'online',
    features: ['Windows 10 64-bit', 'CORS Proxy', 'Secure', 'High Performance'],
    endpoint: 'https://proxy.cors.sh',
    healthCheck: 'https://proxy.cors.sh/https://httpbin.org/status/200',
    region: 'global'
  },
  {
    id: 'cors-proxy',
    name: 'CORS Proxy',
    city: 'Global',
    country: 'Worldwide',
    flag: '🌍',
    latency: '32ms',
    status: 'online',
    features: ['Windows 10 64-bit', 'CORS Proxy', 'Reliable', 'Fast'],
    endpoint: 'https://corsproxy.io',
    healthCheck: 'https://corsproxy.io/?https://httpbin.org/status/200',
    region: 'global'
  },
  {
    id: 'yacdn',
    name: 'YACDN',
    city: 'Global',
    country: 'Worldwide',
    flag: '🌍',
    latency: '40ms',
    status: 'online',
    features: ['Windows 10 64-bit', 'CORS Proxy', 'Stable', 'Wide Support'],
    endpoint: 'https://yacdn.org/proxy',
    healthCheck: 'https://yacdn.org/proxy/https://httpbin.org/status/200',
    region: 'global'
  },
  {
    id: 'cors-everywhere',
    name: 'CORS Everywhere',
    city: 'Global',
    country: 'Worldwide',
    flag: '🌍',
    latency: '38ms',
    status: 'online',
    features: ['Windows 10 64-bit', 'CORS Proxy', 'Reliable', 'Fast Response'],
    endpoint: 'https://cors-everywhere.herokuapp.com',
    healthCheck: 'https://cors-everywhere.herokuapp.com/https://httpbin.org/status/200',
    region: 'global'
  }
];

// Health check function
export async function checkServerHealth(server: ServerConfig): Promise<boolean> {
  try {
    const response = await fetch(server.healthCheck, {
      method: 'GET',
      headers: {
        'User-Agent': 'Saphire-Health-Check/1.0'
      },
      signal: AbortSignal.timeout(5000) // 5 second timeout
    });
    return response.ok;
  } catch (error) {
    console.error(`Health check failed for ${server.name}:`, error);
    return false;
  }
}

// Check all servers health
export async function checkAllServersHealth(): Promise<ServerConfig[]> {
  const healthChecks = await Promise.allSettled(
    REAL_SERVERS.map(async (server) => {
      const isHealthy = await checkServerHealth(server);
      return {
        ...server,
        status: isHealthy ? 'online' : 'offline' as const
      };
    })
  );

  return healthChecks.map((result, index) => {
    if (result.status === 'fulfilled') {
      return result.value;
    } else {
      return {
        ...REAL_SERVERS[index],
        status: 'offline' as const
      };
    }
  }) as ServerConfig[];
}

// Get available servers (online only)
export function getAvailableServers(servers: ServerConfig[]): ServerConfig[] {
  return servers.filter(server => server.status === 'online');
}

// Get server by ID
export function getServerById(id: string): ServerConfig | undefined {
  return REAL_SERVERS.find(server => server.id === id);
}
