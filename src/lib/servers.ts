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
    name: 'Saphire Server',
    city: 'Washington DC',
    country: 'United States',
    flag: '🇺🇸',
    latency: '12ms',
    status: 'online',
    features: ['Windows 10 64-bit', 'Google Services Enhanced', 'High Speed', 'Government Grade'],
    endpoint: 'https://proxy-us-east.saphire.dev',
    healthCheck: 'https://proxy-us-east.saphire.dev/health',
    region: 'us-east'
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
