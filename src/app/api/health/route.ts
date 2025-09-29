import { NextResponse } from 'next/server';
import { checkAllServersHealth, getAvailableServers } from '@/lib/servers';

export async function GET() {
  try {
    // Check health of all servers
    const serversWithHealth = await checkAllServersHealth();
    const availableServers = getAvailableServers(serversWithHealth);
    
    return NextResponse.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      servers: {
        total: serversWithHealth.length,
        online: availableServers.length,
        offline: serversWithHealth.length - availableServers.length
      },
      availableServers: availableServers.map(server => ({
        id: server.id,
        name: server.name,
        region: server.region,
        endpoint: server.endpoint,
        latency: server.latency,
        status: server.status
      })),
      allServers: serversWithHealth.map(server => ({
        id: server.id,
        name: server.name,
        region: server.region,
        status: server.status,
        latency: server.latency
      }))
    });
  } catch (error) {
    console.error('Health check error:', error);
    return NextResponse.json(
      { 
        status: 'error', 
        message: 'Failed to check server health',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}
