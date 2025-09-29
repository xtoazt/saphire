"use client";

import React, { useState } from "react";
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
import { Globe, MessageCircle, Settings, ExternalLink, Copy, Check, Loader2, MapPin } from "lucide-react";

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
}

interface ServerLocation {
  id: string;
  name: string;
  city: string;
  country: string;
  flag: string;
  latency: string;
  status: 'online' | 'offline' | 'maintenance';
  features: string[];
}

const SERVER_LOCATIONS: ServerLocation[] = [
  {
    id: 'washington-dc',
    name: 'Washington DC',
    city: 'Washington DC',
    country: 'United States',
    flag: '🇺🇸',
    latency: '12ms',
    status: 'online',
    features: ['Google Services Enhanced', 'High Speed', 'Government Grade']
  },
  {
    id: 'london',
    name: 'London',
    city: 'London',
    country: 'United Kingdom',
    flag: '🇬🇧',
    latency: '45ms',
    status: 'online',
    features: ['EU Compliance', 'Fast CDN', 'Privacy Focused']
  },
  {
    id: 'singapore',
    name: 'Singapore',
    city: 'Singapore',
    country: 'Singapore',
    flag: '🇸🇬',
    latency: '8ms',
    status: 'online',
    features: ['Asia Pacific', 'Ultra Low Latency', '24/7 Support']
  },
  {
    id: 'tokyo',
    name: 'Tokyo',
    city: 'Tokyo',
    country: 'Japan',
    flag: '🇯🇵',
    latency: '15ms',
    status: 'online',
    features: ['Japanese Sites', 'High Bandwidth', 'Gaming Optimized']
  },
  {
    id: 'frankfurt',
    name: 'Frankfurt',
    city: 'Frankfurt',
    country: 'Germany',
    flag: '🇩🇪',
    latency: '38ms',
    status: 'online',
    features: ['GDPR Compliant', 'European Hub', 'Secure']
  },
  {
    id: 'sydney',
    name: 'Sydney',
    city: 'Sydney',
    country: 'Australia',
    flag: '🇦🇺',
    latency: '22ms',
    status: 'online',
    features: ['Oceania Coverage', 'Fast Streaming', 'Local Content']
  },
  {
    id: 'toronto',
    name: 'Toronto',
    city: 'Toronto',
    country: 'Canada',
    flag: '🇨🇦',
    latency: '18ms',
    status: 'online',
    features: ['North America', 'Privacy Laws', 'High Reliability']
  },
  {
    id: 'mumbai',
    name: 'Mumbai',
    city: 'Mumbai',
    country: 'India',
    flag: '🇮🇳',
    latency: '25ms',
    status: 'online',
    features: ['South Asia', 'Local Services', 'Cost Effective']
  }
];

export default function Home() {
  const [url, setUrl] = useState("");
  const [proxyUrl, setProxyUrl] = useState("");
  const [proxyInfo, setProxyInfo] = useState<ProxyInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [chatMessage, setChatMessage] = useState("");
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [darkMode, setDarkMode] = useState(true);
  const [copied, setCopied] = useState(false);
  const [selectedServer, setSelectedServer] = useState<ServerLocation>(SERVER_LOCATIONS[0]);
  const [baseUrl, setBaseUrl] = useState('');

  // Set base URL on client side
  React.useEffect(() => {
    setBaseUrl(window.location.origin);
  }, []);

  const handleProxyRequest = async () => {
    if (!url) return;
    
    setIsLoading(true);
    try {
      const response = await fetch('/api/proxy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url, serverLocation: selectedServer.id }),
      });
      
      const data = await response.json();
      setProxyUrl(data.proxyUrl);
      setProxyInfo(data);
    } catch (error) {
      console.error('Proxy request failed:', error);
    } finally {
      setIsLoading(false);
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
      <div className="container mx-auto px-4 py-6">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-white text-black rounded flex items-center justify-center font-mono text-sm font-bold">
              S
            </div>
            <div>
              <h1 className="text-2xl font-mono font-bold text-white">Saphire</h1>
              <p className="text-gray-400 font-mono text-sm">Developer proxy with AI integration</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1 bg-gray-900 border border-gray-700 rounded">
              <span className="text-sm font-mono">{selectedServer.name}</span>
              <span className="text-xs text-gray-400 font-mono">{selectedServer.latency}</span>
            </div>
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
                        {SERVER_LOCATIONS.map((server) => (
                          <div
                            key={server.id}
                            className={`p-3 rounded border cursor-pointer transition-all ${
                              selectedServer.id === server.id
                                ? 'bg-white text-black'
                                : 'bg-gray-800 border-gray-600 text-gray-300 hover:bg-gray-700'
                            }`}
                            onClick={() => setSelectedServer(server)}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
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
        <Tabs defaultValue="proxy" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-gray-900 border-gray-700">
            <TabsTrigger value="proxy" className="data-[state=active]:bg-white data-[state=active]:text-black font-mono">
              <Globe className="w-4 h-4 mr-2" />
              Proxy
            </TabsTrigger>
            <TabsTrigger value="api" className="data-[state=active]:bg-white data-[state=active]:text-black font-mono">
              <Settings className="w-4 h-4 mr-2" />
              API
            </TabsTrigger>
            <TabsTrigger value="chat" className="data-[state=active]:bg-white data-[state=active]:text-black font-mono">
              <MessageCircle className="w-4 h-4 mr-2" />
              AI
            </TabsTrigger>
          </TabsList>

          <TabsContent value="proxy" className="mt-6">
            <Card className="bg-gray-900 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2 font-mono">
                  <Globe className="w-4 h-4" />
                  Web Proxy
                </CardTitle>
                <CardDescription className="text-gray-400 font-mono text-sm">
                  HTTP/HTTPS proxy with URL rewriting and content processing
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    type="url"
                    placeholder="https://example.com"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    className="flex-1 bg-black border-gray-600 text-white placeholder:text-gray-500 focus:border-white font-mono"
                  />
                  <Button
                    onClick={handleProxyRequest}
                    disabled={isLoading || !url}
                    className="bg-white text-black hover:bg-gray-200 font-mono"
                  >
                    {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "PROXY"}
                  </Button>
                </div>
                
                {proxyUrl && proxyInfo && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="bg-green-900 text-green-400 border-green-700 font-mono text-xs">
                        READY
                      </Badge>
                      {proxyInfo.enhanced && (
                        <Badge variant="secondary" className="bg-blue-900 text-blue-400 border-blue-700 font-mono text-xs">
                          GOOGLE+
                        </Badge>
                      )}
                      <Badge variant="outline" className="text-gray-300 border-gray-600 font-mono text-xs">
                        {proxyInfo.location}
                      </Badge>
                    </div>
                    
                    <div className="bg-black border border-gray-700 rounded p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-gray-300 font-mono">PROXY_URL:</p>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(proxyUrl)}
                          className="text-gray-400 hover:text-white font-mono text-xs"
                        >
                          {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                        </Button>
                      </div>
                      <code className="text-green-400 text-sm break-all bg-gray-900 p-3 rounded block font-mono border border-gray-800">
                        {proxyUrl}
            </code>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                        <div>
                          <h4 className="text-sm font-semibold text-white mb-2 font-mono">FEATURES:</h4>
                          <ul className="text-gray-300 space-y-1 font-mono">
                            {proxyInfo.features?.slice(0, 3).map((feature: string, index: number) => (
                              <li key={index} className="flex items-center gap-2">
                                <span className="text-white">•</span>
                                {feature}
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <h4 className="text-sm font-semibold text-white mb-2 font-mono">STATUS:</h4>
                          <ul className="text-gray-300 space-y-1 font-mono">
                            <li className="flex items-center gap-2">
                              <span className="text-green-400">✓</span>
                              URL Rewriting
                            </li>
                            <li className="flex items-center gap-2">
                              <span className="text-green-400">✓</span>
                              Content Processing
          </li>
                            <li className="flex items-center gap-2">
                              <span className="text-green-400">✓</span>
                              Security Headers
          </li>
                          </ul>
                        </div>
                      </div>
                      
                      <Button
                        onClick={() => window.open(proxyUrl, '_blank')}
                        className="w-full bg-white text-black hover:bg-gray-200 font-mono"
                      >
                        <ExternalLink className="w-4 h-4 mr-2" />
                        OPEN_PROXY
                      </Button>
                    </div>
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
                  API Integration
                </CardTitle>
                <CardDescription className="text-gray-400 font-mono text-sm">
                  Easy integration examples for developers
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
                        onClick={() => copyToClipboard(`const proxyUrl = '${baseUrl}/api/proxy-fetch?url=';

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
                    <code className="text-green-400 text-xs font-mono block whitespace-pre-wrap">{`const proxyUrl = '${baseUrl}/api/proxy-fetch?url=';

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

PROXY_BASE = '${baseUrl}/api/proxy-fetch?url='

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

PROXY_BASE = '${baseUrl}/api/proxy-fetch?url='

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
                        onClick={() => copyToClipboard(`curl "${baseUrl}/api/proxy-fetch?url=https://example.com"`)}
                        className="text-gray-400 hover:text-white font-mono text-xs"
                      >
                        <Copy className="w-3 h-3" />
                      </Button>
                    </div>
                    <code className="text-green-400 text-xs font-mono block">{`curl "${baseUrl}/api/proxy-fetch?url=https://example.com"`}</code>
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
      const response = await fetch(\`${baseUrl}/api/proxy-fetch?url=\${encodeURIComponent(url)}\`);
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
      const response = await fetch(\`${baseUrl}/api/proxy-fetch?url=\${encodeURIComponent(url)}\`);
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
                      <code className="text-white font-mono text-xs">{baseUrl}/api/proxy-fetch?url=</code>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="bg-blue-900 text-blue-400 border-blue-700 font-mono text-xs">POST</Badge>
                      <code className="text-white font-mono text-xs">{baseUrl}/api/proxy</code>
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
                  AI Assistant
                </CardTitle>
                <CardDescription className="text-gray-400 font-mono text-sm">
                  LLM7.io powered AI chat for developers
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
  );
}