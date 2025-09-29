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
    id: 'london',
    name: 'London',
    city: 'London',
    country: 'United Kingdom',
    flag: '🇬🇧',
    latency: '45ms',
    status: 'online',
    features: ['Windows 10 64-bit', 'EU Compliance', 'Fast CDN', 'Privacy Focused'],
    endpoint: 'https://proxy-eu-west.saphire.dev',
    healthCheck: 'https://proxy-eu-west.saphire.dev/health',
    region: 'eu-west'
  },
  {
    id: 'singapore',
    name: 'Singapore',
    city: 'Singapore',
    country: 'Singapore',
    flag: '🇸🇬',
    latency: '8ms',
    status: 'online',
    features: ['Windows 10 64-bit', 'Asia Pacific', 'Ultra Low Latency', '24/7 Support'],
    endpoint: 'https://proxy-ap-southeast.saphire.dev',
    healthCheck: 'https://proxy-ap-southeast.saphire.dev/health',
    region: 'ap-southeast'
  },
  {
    id: 'tokyo',
    name: 'Tokyo',
    city: 'Tokyo',
    country: 'Japan',
    flag: '🇯🇵',
    latency: '15ms',
    status: 'maintenance',
    features: ['Windows 10 64-bit', 'Japanese Sites', 'High Bandwidth', 'Gaming Optimized'],
    endpoint: 'https://proxy-ap-northeast.saphire.dev',
    healthCheck: 'https://proxy-ap-northeast.saphire.dev/health',
    region: 'ap-northeast'
  },
  {
    id: 'frankfurt',
    name: 'Frankfurt',
    city: 'Frankfurt',
    country: 'Germany',
    flag: '🇩🇪',
    latency: '38ms',
    status: 'offline',
    features: ['Windows 10 64-bit', 'GDPR Compliant', 'European Hub', 'Secure'],
    endpoint: 'https://proxy-eu-central.saphire.dev',
    healthCheck: 'https://proxy-eu-central.saphire.dev/health',
    region: 'eu-central'
  },
  {
    id: 'sydney',
    name: 'Sydney',
    city: 'Sydney',
    country: 'Australia',
    flag: '🇦🇺',
    latency: '22ms',
    status: 'online',
    features: ['Windows 10 64-bit', 'Oceania Coverage', 'Fast Streaming', 'Local Content'],
    endpoint: 'https://proxy-ap-southeast-2.saphire.dev',
    healthCheck: 'https://proxy-ap-southeast-2.saphire.dev/health',
    region: 'ap-southeast-2'
  },
  {
    id: 'toronto',
    name: 'Toronto',
    city: 'Toronto',
    country: 'Canada',
    flag: '🇨🇦',
    latency: '18ms',
    status: 'online',
    features: ['Windows 10 64-bit', 'North America', 'Privacy Laws', 'High Reliability'],
    endpoint: 'https://proxy-ca-central.saphire.dev',
    healthCheck: 'https://proxy-ca-central.saphire.dev/health',
    region: 'ca-central'
  },
  {
    id: 'mumbai',
    name: 'Mumbai',
    city: 'Mumbai',
    country: 'India',
    flag: '🇮🇳',
    latency: '25ms',
    status: 'online',
    features: ['Windows 10 64-bit', 'South Asia', 'Local Services', 'Cost Effective'],
    endpoint: 'https://proxy-ap-south.saphire.dev',
    healthCheck: 'https://proxy-ap-south.saphire.dev/health',
    region: 'ap-south'
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
