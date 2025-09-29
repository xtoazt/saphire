"use client";

import React, { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Globe, MessageCircle, Settings, ExternalLink, Copy, Check, Loader2, MapPin, RefreshCw } from "lucide-react";
import { REAL_SERVERS, type ServerConfig } from '@/lib/servers';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface ProxyInfo {
  proxyUrl: string;
  originalUrl: string;
  message: string;
  enhanced: boolean;
  location: string;
  features: string[];
  supportedSites: string[];
  searchQuery?: string;
  serverEndpoint?: string;
  serverRegion?: string;
}


export default function Home() {
  const [searchQuery, setSearchQuery] = useState("");
  const [proxyUrl, setProxyUrl] = useState("");
  const [proxyInfo, setProxyInfo] = useState<ProxyInfo | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [chatMessage, setChatMessage] = useState("");
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [darkMode, setDarkMode] = useState(true);
  const [copied, setCopied] = useState(false);
  const [selectedServer, setSelectedServer] = useState<ServerConfig>(() => {
    // Always default to Saphire Server (Washington DC)
    const saphireServer = REAL_SERVERS.find(s => s.id === 'washington-dc');
    return saphireServer || REAL_SERVERS[0];
  });
  const [availableServers, setAvailableServers] = useState<ServerConfig[]>([]);
  const [isCheckingHealth, setIsCheckingHealth] = useState(false);
  const [baseUrl, setBaseUrl] = useState('');

  // Set base URL on client side
  React.useEffect(() => {
    setBaseUrl(window.location.origin);
  }, []);

  const checkServerHealth = useCallback(async () => {
    setIsCheckingHealth(true);
    try {
      const response = await fetch('/api/health');
      const data = await response.json();
      
      if (data.status === 'ok') {
        // Update available servers
        const servers = REAL_SERVERS.map(server => {
          const healthData = data.allServers.find((s: { id: string; status: string }) => s.id === server.id);
          return {
            ...server,
            status: healthData ? healthData.status as 'online' | 'offline' | 'maintenance' : 'offline'
          };
        });
        
        setAvailableServers(servers);
        
        // Only switch servers if current server is offline
        const currentServerHealth = servers.find(s => s.id === selectedServer.id);
        if (currentServerHealth?.status !== 'online') {
          // First try to use Saphire Server if it's online
          const saphireServer = servers.find(s => s.id === 'washington-dc' && s.status === 'online');
          if (saphireServer) {
            setSelectedServer(saphireServer);
          } else {
            // Fallback to first available server only if Saphire Server is offline
            const firstOnline = servers.find(s => s.status === 'online');
            if (firstOnline) {
              setSelectedServer(firstOnline);
            }
          }
        }
      }
    } catch (error) {
      console.error('Failed to check server health:', error);
    } finally {
      setIsCheckingHealth(false);
    }
  }, [selectedServer.id]);

  // Check server health on component mount
  React.useEffect(() => {
    checkServerHealth();
  }, [checkServerHealth]);

  const handleUnifiedProxy = async () => {
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    try {
      // Determine if it's a URL or search query
      let targetUrl: string;
      let isSearch = false;
      
      if (searchQuery.startsWith('http://') || searchQuery.startsWith('https://')) {
        // It's a direct URL
        targetUrl = searchQuery;
      } else {
        // It's a search query - create Google search URL
        targetUrl = `https://www.google.com/search?q=${encodeURIComponent(searchQuery)}`;
        isSearch = true;
      }
      
      // Generate proxy URL based on server type
      let proxyUrl: string;
      
      if (selectedServer.id === 'washington-dc') {
        // Use our custom proxy
        const response = await fetch('/api/proxy', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            url: targetUrl, 
            serverLocation: selectedServer.id,
            region: selectedServer.region 
          }),
        });
        const data = await response.json();
        proxyUrl = data.proxyUrl;
      } else {
        // Use external proxy services
        switch (selectedServer.id) {
          case 'allorigins':
            proxyUrl = `${selectedServer.endpoint}?url=${encodeURIComponent(targetUrl)}`;
            break;
          case 'cors-anywhere':
          case 'cors-everywhere':
            proxyUrl = `${selectedServer.endpoint}/${targetUrl}`;
            break;
          case 'thingproxy':
            proxyUrl = `${selectedServer.endpoint}/${targetUrl}`;
            break;
          case 'proxy-cors':
            proxyUrl = `${selectedServer.endpoint}/${targetUrl}`;
            break;
          case 'cors-proxy':
            proxyUrl = `${selectedServer.endpoint}/?${targetUrl}`;
            break;
          case 'yacdn':
            proxyUrl = `${selectedServer.endpoint}/${targetUrl}`;
            break;
          default:
            proxyUrl = `${selectedServer.endpoint}/${targetUrl}`;
        }
      }
      
      // Instantly open the proxy URL
      window.open(proxyUrl, '_blank');
      
      setProxyUrl(proxyUrl);
      setProxyInfo({
        proxyUrl,
        originalUrl: targetUrl,
        message: 'Opened successfully',
        enhanced: isSearch,
        location: `${selectedServer.name}, ${selectedServer.country}`,
        features: selectedServer.features,
        supportedSites: isSearch ? ['Google services', 'Search results', 'Web content'] : ['Web content', 'APIs', 'Resources'],
        searchQuery: isSearch ? searchQuery : undefined,
        serverEndpoint: selectedServer.endpoint,
        serverRegion: selectedServer.region
      });
    } catch (error) {
      console.error('Proxy request failed:', error);
    } finally {
      setIsSearching(false);
    }
  };


  const handleChatSubmit = async () => {
    if (!chatMessage.trim()) return;
    
    const userMessage: ChatMessage = { role: 'user', content: chatMessage, timestamp: new Date() };
    setChatHistory(prev => [...prev, userMessage]);
    setChatMessage("");
    setIsChatLoading(true);
    
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: chatMessage, history: chatHistory }),
      });
      
      const data = await response.json();
      const aiMessage: ChatMessage = { role: 'assistant', content: data.response, timestamp: new Date() };
      setChatHistory(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Chat request failed:', error);
    } finally {
      setIsChatLoading(false);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="w-full px-4 py-4">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-white text-black rounded flex items-center justify-center font-mono text-sm font-bold">
              S
            </div>
            <div>
              <h1 className="text-3xl font-mono font-bold text-white">Saphire</h1>
              <p className="text-gray-400 font-mono text-sm">Undetectable • Windows 10 64-bit • Proxy</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1 bg-gray-900 border border-gray-700 rounded">
              <div className={`w-2 h-2 rounded-full ${
                selectedServer.status === 'online' ? 'bg-green-500' : 
                selectedServer.status === 'maintenance' ? 'bg-yellow-500' : 'bg-red-500'
              }`}></div>
              <span className="text-sm font-mono">{selectedServer.name}</span>
              <span className="text-xs text-gray-400 font-mono">{selectedServer.latency}</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={checkServerHealth}
              disabled={isCheckingHealth}
              className="text-gray-400 hover:text-white font-mono text-xs"
            >
              {isCheckingHealth ? <Loader2 className="w-3 h-3 animate-spin" /> : <RefreshCw className="w-3 h-3" />}
            </Button>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-400 font-mono">Dark</span>
              <Switch
                checked={darkMode}
                onCheckedChange={setDarkMode}
                className="data-[state=checked]:bg-white"
              />
            </div>
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="ghost" size="icon" className="text-slate-300 hover:text-white">
                  <Settings className="w-5 h-5" />
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-gray-900 border-gray-700">
                <DialogHeader>
                  <DialogTitle className="text-white font-mono">Settings</DialogTitle>
                  <DialogDescription className="text-gray-400 font-mono text-sm">
                    Configure your Saphire experience
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <span className="text-white font-mono">Dark Mode</span>
                    <Switch
                      checked={darkMode}
                      onCheckedChange={setDarkMode}
                      className="data-[state=checked]:bg-white"
                    />
                  </div>
                  
                  <Separator className="bg-gray-700" />
                  
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-white" />
                      <span className="text-white font-semibold font-mono">Proxy Server Location</span>
                    </div>
                    <ScrollArea className="h-64 w-full">
                      <div className="space-y-2">
                        {(availableServers.length > 0 ? availableServers : REAL_SERVERS).map((server) => (
                          <div
                            key={server.id}
                            className={`p-3 rounded border transition-all ${
                              server.status === 'online' 
                                ? selectedServer.id === server.id
                                  ? 'bg-white text-black cursor-pointer'
                                  : 'bg-gray-800 border-gray-600 text-gray-300 hover:bg-gray-700 cursor-pointer'
                                : 'bg-gray-900 border-gray-800 text-gray-500 cursor-not-allowed opacity-50'
                            }`}
                            onClick={() => server.status === 'online' && setSelectedServer(server)}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div className={`w-2 h-2 rounded-full ${
                                  server.status === 'online' ? 'bg-green-500' : 
                                  server.status === 'maintenance' ? 'bg-yellow-500' : 'bg-red-500'
                                }`}></div>
                                <span className="text-sm font-mono">{server.name}</span>
                                <div className="text-xs opacity-75 font-mono">
                                  {server.city}, {server.country}
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="text-xs font-medium font-mono">{server.latency}</div>
                                <div className={`text-xs font-mono ${
                                  server.status === 'online' ? 'text-green-400' : 
                                  server.status === 'maintenance' ? 'text-yellow-400' : 'text-red-400'
                                }`}>
                                  {server.status}
                                </div>
                              </div>
                            </div>
                            <div className="mt-2 flex flex-wrap gap-1">
                              {server.features.slice(0, 2).map((feature, index) => (
                                <Badge key={index} variant="secondary" className="text-xs bg-gray-700 text-gray-300 font-mono">
                                  {feature}
                                </Badge>
                              ))}
                            </div>
                            {server.status === 'online' && (
                              <div className="mt-2 text-xs text-gray-400 font-mono">
                                Endpoint: {server.endpoint}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </div>
                  
                  <Separator className="bg-gray-700" />
                  
                  <div className="text-sm text-gray-300">
                    <p className="font-semibold mb-2 font-mono">API Status:</p>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="font-mono">Google API: Connected</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="font-mono">LLM7.io: Connected</span>
                      </div>
                    </div>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Main Content */}
        <div className="w-full h-full">
          <Tabs defaultValue="search" className="w-full h-full">
          <TabsList className="grid w-full grid-cols-3 bg-gray-900 border-gray-700">
            <TabsTrigger value="search" className="data-[state=active]:bg-white data-[state=active]:text-black font-mono">
              <Globe className="w-4 h-4 mr-2" />
              Proxy
            </TabsTrigger>
            <TabsTrigger value="api" className="data-[state=active]:bg-white data-[state=active]:text-black font-mono">
              <Settings className="w-4 h-4 mr-2" />
              API
            </TabsTrigger>
            <TabsTrigger value="chat" className="data-[state=active]:bg-white data-[state=active]:text-black font-mono">
              <MessageCircle className="w-4 h-4 mr-2" />
              Chat
            </TabsTrigger>
          </TabsList>

          <TabsContent value="search" className="mt-6">
            <Card className="bg-gray-900 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2 font-mono">
                  <Globe className="w-5 h-5" />
                  Undetectable Proxy
                </CardTitle>
                <CardDescription className="text-gray-400 font-mono">
                  Search or browse the web undetected through our Windows 10 64-bit proxy
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="Search or enter URL..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleUnifiedProxy()}
                    className="bg-black border-gray-600 text-white placeholder-gray-500 font-mono"
                  />
                  <Button
                    onClick={handleUnifiedProxy}
                    disabled={isSearching || !searchQuery.trim()}
                    className="bg-white text-black hover:bg-gray-200 font-mono"
                  >
                    {isSearching ? <Loader2 className="w-4 h-4 animate-spin" /> : "Go"}
                  </Button>
                </div>

                {proxyInfo && proxyInfo.searchQuery && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Badge className="bg-green-900 text-green-400 font-mono">Search Ready</Badge>
                      <Badge className="bg-blue-900 text-blue-400 font-mono">Google Enhanced</Badge>
                      <Badge variant="outline" className="border-gray-600 text-gray-300 font-mono">
                        {selectedServer.name}
                      </Badge>
                    </div>

                    <div className="bg-black border border-gray-800 rounded p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-gray-400 font-mono text-sm">Search Results</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(proxyUrl)}
                          className="text-gray-400 hover:text-white font-mono text-xs"
                        >
                          {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                        </Button>
                      </div>
                      <code className="text-green-400 text-xs font-mono block break-all">
                        {proxyUrl}
                      </code>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="text-white font-mono text-sm font-semibold mb-2">Undetectable Features</h4>
                        <ul className="space-y-1 text-sm text-gray-300 font-mono">
                          <li className="flex items-center gap-2">
                            <div className="w-1 h-1 bg-white rounded-full"></div>
                            Completely undetectable browsing
                          </li>
                          <li className="flex items-center gap-2">
                            <div className="w-1 h-1 bg-white rounded-full"></div>
                            Windows 10 64-bit rendering
                          </li>
                          <li className="flex items-center gap-2">
                            <div className="w-1 h-1 bg-white rounded-full"></div>
                            Full JavaScript support
                          </li>
                          <li className="flex items-center gap-2">
                            <div className="w-1 h-1 bg-white rounded-full"></div>
                            No tracking or logging
                          </li>
                        </ul>
                      </div>
                      <div>
                        <h4 className="text-white font-mono text-sm font-semibold mb-2">Proxy Status</h4>
                        <ul className="space-y-1 text-sm text-gray-300 font-mono">
                          <li className="flex items-center gap-2">
                            <div className="w-1 h-1 bg-green-500 rounded-full"></div>
                            Windows 10 64-bit Active
                          </li>
                          <li className="flex items-center gap-2">
                            <div className="w-1 h-1 bg-green-500 rounded-full"></div>
                            Google Services Enhanced
                          </li>
                          <li className="flex items-center gap-2">
                            <div className="w-1 h-1 bg-green-500 rounded-full"></div>
                            Real-time Processing
                          </li>
                          <li className="flex items-center gap-2">
                            <div className="w-1 h-1 bg-green-500 rounded-full"></div>
                            High Performance
                          </li>
                        </ul>
                      </div>
                    </div>

                    <Button
                      onClick={() => window.open(proxyUrl, '_blank')}
                      className="w-full bg-white text-black hover:bg-gray-200 font-mono"
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Open Search Results
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>


          <TabsContent value="api" className="mt-6">
            <Card className="bg-gray-900 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2 font-mono">
                  <Settings className="w-4 h-4" />
                  Proxy API
                </CardTitle>
                <CardDescription className="text-gray-400 font-mono text-sm">
                  Integrate with our Windows 10 64-bit proxy
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* JavaScript/Node.js */}
                <div className="space-y-3">
                  <h3 className="text-white font-mono text-sm font-semibold">JavaScript/Node.js</h3>
                  <div className="bg-black border border-gray-700 rounded p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-gray-400 font-mono text-xs">fetch-proxy.js</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(`const proxyUrl = '${selectedServer.status === 'online' ? selectedServer.endpoint : baseUrl}/proxy-fetch?url=';

async function proxyRequest(url) {
  const response = await fetch(proxyUrl + encodeURIComponent(url));
  return response.text();
}

// Usage
proxyRequest('https://example.com').then(html => {
  console.log(html);
});`)}
                        className="text-gray-400 hover:text-white font-mono text-xs"
                      >
                        <Copy className="w-3 h-3" />
                      </Button>
                    </div>
                    <code className="text-green-400 text-xs font-mono block whitespace-pre-wrap">{`const proxyUrl = '${selectedServer.status === 'online' ? selectedServer.endpoint : baseUrl}/proxy-fetch?url=';

async function proxyRequest(url) {
  const response = await fetch(proxyUrl + encodeURIComponent(url));
  return response.text();
}

// Usage
proxyRequest('https://example.com').then(html => {
  console.log(html);
});`}</code>
                  </div>
                </div>

                {/* Python */}
                <div className="space-y-3">
                  <h3 className="text-white font-mono text-sm font-semibold">Python</h3>
                  <div className="bg-black border border-gray-700 rounded p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-gray-400 font-mono text-xs">proxy_client.py</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(`import requests
from urllib.parse import quote

PROXY_BASE = '${selectedServer.status === 'online' ? selectedServer.endpoint : baseUrl}/proxy-fetch?url='

def proxy_request(url):
    response = requests.get(PROXY_BASE + quote(url))
    return response.text

# Usage
html = proxy_request('https://example.com')
print(html)`)}
                        className="text-gray-400 hover:text-white font-mono text-xs"
                      >
                        <Copy className="w-3 h-3" />
                      </Button>
                    </div>
                    <code className="text-green-400 text-xs font-mono block whitespace-pre-wrap">{`import requests
from urllib.parse import quote

PROXY_BASE = '${selectedServer.status === 'online' ? selectedServer.endpoint : baseUrl}/proxy-fetch?url='

def proxy_request(url):
    response = requests.get(PROXY_BASE + quote(url))
    return response.text

# Usage
html = proxy_request('https://example.com')
print(html)`}</code>
                  </div>
                </div>

                {/* cURL */}
                <div className="space-y-3">
                  <h3 className="text-white font-mono text-sm font-semibold">cURL</h3>
                  <div className="bg-black border border-gray-700 rounded p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-gray-400 font-mono text-xs">terminal</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(`curl "${selectedServer.status === 'online' ? selectedServer.endpoint : baseUrl}/proxy-fetch?url=https://example.com"`)}
                        className="text-gray-400 hover:text-white font-mono text-xs"
                      >
                        <Copy className="w-3 h-3" />
                      </Button>
                    </div>
                    <code className="text-green-400 text-xs font-mono block">{`curl "${selectedServer.status === 'online' ? selectedServer.endpoint : baseUrl}/proxy-fetch?url=https://example.com"`}</code>
                  </div>
                </div>

                {/* React Hook */}
                <div className="space-y-3">
                  <h3 className="text-white font-mono text-sm font-semibold">React Hook</h3>
                  <div className="bg-black border border-gray-700 rounded p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-gray-400 font-mono text-xs">useProxy.js</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(`import { useState } from 'react';

export function useProxy() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const proxyRequest = async (url) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(\`${selectedServer.status === 'online' ? selectedServer.endpoint : baseUrl}/proxy-fetch?url=\${encodeURIComponent(url)}\`);
      return await response.text();
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { proxyRequest, loading, error };
}`)}
                        className="text-gray-400 hover:text-white font-mono text-xs"
                      >
                        <Copy className="w-3 h-3" />
                      </Button>
                    </div>
                    <code className="text-green-400 text-xs font-mono block whitespace-pre-wrap">{`import { useState } from 'react';

export function useProxy() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const proxyRequest = async (url) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(\`${selectedServer.status === 'online' ? selectedServer.endpoint : baseUrl}/proxy-fetch?url=\${encodeURIComponent(url)}\`);
      return await response.text();
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { proxyRequest, loading, error };
}`}</code>
                  </div>
                </div>

                {/* API Endpoints */}
                <div className="space-y-3">
                  <h3 className="text-white font-mono text-sm font-semibold">API Endpoints</h3>
                  <div className="bg-black border border-gray-700 rounded p-4 space-y-2">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="bg-green-900 text-green-400 border-green-700 font-mono text-xs">GET</Badge>
                      <code className="text-white font-mono text-xs">{selectedServer.status === 'online' ? selectedServer.endpoint : baseUrl}/proxy-fetch?url=</code>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="bg-blue-900 text-blue-400 border-blue-700 font-mono text-xs">POST</Badge>
                      <code className="text-white font-mono text-xs">{selectedServer.status === 'online' ? selectedServer.endpoint : baseUrl}/proxy</code>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="bg-purple-900 text-purple-400 border-purple-700 font-mono text-xs">POST</Badge>
                      <code className="text-white font-mono text-xs">{baseUrl}/api/chat</code>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="chat" className="mt-6">
            <Card className="bg-gray-900 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2 font-mono">
                  <MessageCircle className="w-4 h-4" />
                  Chat Assistant
                </CardTitle>
                <CardDescription className="text-gray-400 font-mono text-sm">
                  Chat feature for developers
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <ScrollArea className="h-96 w-full rounded-lg border border-gray-700 bg-black p-4">
                  {chatHistory.length === 0 ? (
                    <div className="text-center text-gray-400 py-8">
                      <MessageCircle className="w-8 h-8 mx-auto mb-4 opacity-50" />
                      <p className="font-mono text-sm">Start a conversation with the AI assistant</p>
        </div>
                  ) : (
                    <div className="space-y-4">
                      {chatHistory.map((message, index) => (
                        <div
                          key={index}
                          className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                          <div className={`flex max-w-xs lg:max-w-md ${message.role === 'user' ? 'flex-row-reverse' : 'flex-row'} items-start gap-2`}>
                            <Avatar className="w-6 h-6">
                              <AvatarFallback className={message.role === 'user' ? 'bg-white text-black' : 'bg-gray-700 text-white'}>
                                {message.role === 'user' ? 'U' : 'AI'}
                              </AvatarFallback>
                            </Avatar>
                            <div className={`flex flex-col ${message.role === 'user' ? 'items-end' : 'items-start'}`}>
                              <div
                                className={`px-3 py-2 rounded ${
                                  message.role === 'user'
                                    ? 'bg-white text-black'
                                    : 'bg-gray-800 text-white border border-gray-700'
                                }`}
                              >
                                <p className="text-xs whitespace-pre-wrap font-mono">{message.content}</p>
                              </div>
                              <p className="text-xs text-gray-500 mt-1 font-mono">
                                {message.timestamp.toLocaleTimeString()}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                      {isChatLoading && (
                        <div className="flex justify-start">
                          <div className="flex items-start gap-2">
                            <Avatar className="w-6 h-6">
                              <AvatarFallback className="bg-gray-700 text-white">
                                AI
                              </AvatarFallback>
                            </Avatar>
                            <div className="bg-gray-800 text-white px-3 py-2 rounded border border-gray-700">
                              <div className="flex items-center gap-2">
                                <Loader2 className="w-3 h-3 animate-spin" />
                                <span className="text-xs font-mono">AI is thinking...</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </ScrollArea>
                
                <div className="flex gap-2">
                  <Textarea
                    placeholder="Ask the AI assistant..."
                    value={chatMessage}
                    onChange={(e) => setChatMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleChatSubmit())}
                    className="flex-1 bg-black border-gray-600 text-white placeholder:text-gray-500 focus:border-white resize-none font-mono text-sm"
                    rows={1}
                  />
                  <Button
                    onClick={handleChatSubmit}
                    disabled={!chatMessage.trim() || isChatLoading}
                    className="bg-white text-black hover:bg-gray-200 font-mono"
                  >
                    SEND
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        </div>
      </div>
    </div>
  );
}