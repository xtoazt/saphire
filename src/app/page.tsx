"use client";

import { useState } from "react";
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
import { Globe, MessageCircle, Settings, ExternalLink, Copy, Check, Loader2, Sparkles, MapPin } from "lucide-react";

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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <div className="container mx-auto px-4 py-6">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
              <Sparkles className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-white">Saphire</h1>
              <p className="text-slate-300">Beautiful AI-powered web proxy</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1 bg-slate-800/50 rounded-lg border border-slate-700">
              <span className="text-lg">{selectedServer.flag}</span>
              <div className="text-sm">
                <div className="text-white font-medium">{selectedServer.name}</div>
                <div className="text-slate-400 text-xs">{selectedServer.latency}</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-300">Dark Mode</span>
              <Switch
                checked={darkMode}
                onCheckedChange={setDarkMode}
                className="data-[state=checked]:bg-purple-600"
              />
            </div>
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="ghost" size="icon" className="text-slate-300 hover:text-white">
                  <Settings className="w-5 h-5" />
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-slate-800 border-slate-700">
                <DialogHeader>
                  <DialogTitle className="text-white">Settings</DialogTitle>
                  <DialogDescription className="text-slate-400">
                    Configure your Saphire experience
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <span className="text-white">Dark Mode</span>
                    <Switch
                      checked={darkMode}
                      onCheckedChange={setDarkMode}
                      className="data-[state=checked]:bg-purple-600"
                    />
                  </div>
                  
                  <Separator className="bg-slate-700" />
                  
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-purple-400" />
                      <span className="text-white font-semibold">Proxy Server Location</span>
                    </div>
                    <ScrollArea className="h-64 w-full">
                      <div className="space-y-2">
                        {SERVER_LOCATIONS.map((server) => (
                          <div
                            key={server.id}
                            className={`p-3 rounded-lg border cursor-pointer transition-all ${
                              selectedServer.id === server.id
                                ? 'bg-purple-600/20 border-purple-500 text-white'
                                : 'bg-slate-700/50 border-slate-600 text-slate-300 hover:bg-slate-600/50'
                            }`}
                            onClick={() => setSelectedServer(server)}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <span className="text-lg">{server.flag}</span>
                                <div>
                                  <div className="font-medium">{server.name}</div>
                                  <div className="text-xs opacity-75">{server.city}, {server.country}</div>
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="text-xs font-medium">{server.latency}</div>
                                <div className={`text-xs ${
                                  server.status === 'online' ? 'text-green-400' : 
                                  server.status === 'maintenance' ? 'text-yellow-400' : 'text-red-400'
                                }`}>
                                  {server.status}
                                </div>
                              </div>
                            </div>
                            <div className="mt-2 flex flex-wrap gap-1">
                              {server.features.slice(0, 2).map((feature, index) => (
                                <Badge key={index} variant="secondary" className="text-xs bg-slate-600/50 text-slate-300">
                                  {feature}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </div>
                  
                  <Separator className="bg-slate-700" />
                  
                  <div className="text-sm text-slate-300">
                    <p className="font-semibold mb-2">API Status:</p>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span>Google API: Connected</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span>LLM7.io: Connected</span>
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
          <TabsList className="grid w-full grid-cols-2 bg-slate-800/50 border-slate-700">
            <TabsTrigger value="proxy" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white">
              <Globe className="w-4 h-4 mr-2" />
              Web Proxy
            </TabsTrigger>
            <TabsTrigger value="chat" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white">
              <MessageCircle className="w-4 h-4 mr-2" />
              AI Chat
            </TabsTrigger>
          </TabsList>

          <TabsContent value="proxy" className="mt-6">
            <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Globe className="w-5 h-5" />
                  Web Proxy
                </CardTitle>
                <CardDescription className="text-slate-400">
                  Browse the web securely through our proxy with AI enhancement
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    type="url"
                    placeholder="Enter URL to proxy..."
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    className="flex-1 bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 focus:border-purple-500"
                  />
                  <Button
                    onClick={handleProxyRequest}
                    disabled={isLoading || !url}
                    className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                  >
                    {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Proxy"}
                  </Button>
                </div>
                
                {proxyUrl && proxyInfo && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="bg-green-500/20 text-green-400 border-green-500/30">
                        Proxy URL Generated
                      </Badge>
                      {proxyInfo.enhanced && (
                        <Badge variant="secondary" className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                          Enhanced for Google Services
                        </Badge>
                      )}
                      <Badge variant="outline" className="text-slate-300 border-slate-600">
                        📍 {proxyInfo.location}
                      </Badge>
                    </div>
                    
                    <div className="bg-slate-900/50 rounded-lg p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-slate-300">Proxy URL:</p>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(proxyUrl)}
                          className="text-slate-400 hover:text-white"
                        >
                          {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                        </Button>
                      </div>
                      <code className="text-green-400 text-sm break-all bg-slate-800/50 p-2 rounded block">
                        {proxyUrl}
                      </code>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h4 className="text-sm font-semibold text-white mb-2">✨ Features:</h4>
                          <ul className="text-xs text-slate-300 space-y-1">
                            {proxyInfo.features?.slice(0, 3).map((feature: string, index: number) => (
                              <li key={index} className="flex items-center gap-2">
                                <div className="w-1 h-1 bg-purple-400 rounded-full"></div>
                                {feature}
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <h4 className="text-sm font-semibold text-white mb-2">🌐 Supported Sites:</h4>
                          <ul className="text-xs text-slate-300 space-y-1">
                            {proxyInfo.supportedSites?.slice(0, 3).map((site: string, index: number) => (
                              <li key={index} className="flex items-center gap-2">
                                <div className="w-1 h-1 bg-blue-400 rounded-full"></div>
                                {site}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                      
                      <Button
                        onClick={() => window.open(proxyUrl, '_blank')}
                        className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                      >
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Open Proxy
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="chat" className="mt-6">
            <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <MessageCircle className="w-5 h-5" />
                  AI Assistant
                </CardTitle>
                <CardDescription className="text-slate-400">
                  Chat with our AI assistant powered by LLM7.io
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <ScrollArea className="h-96 w-full rounded-lg border border-slate-700 bg-slate-900/50 p-4">
                  {chatHistory.length === 0 ? (
                    <div className="text-center text-slate-400 py-8">
                      <MessageCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>Start a conversation with the AI assistant</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {chatHistory.map((message, index) => (
                        <div
                          key={index}
                          className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                          <div className={`flex max-w-xs lg:max-w-md ${message.role === 'user' ? 'flex-row-reverse' : 'flex-row'} items-start gap-2`}>
                            <Avatar className="w-8 h-8">
                              <AvatarFallback className={message.role === 'user' ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white' : 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white'}>
                                {message.role === 'user' ? 'U' : 'AI'}
                              </AvatarFallback>
                            </Avatar>
                            <div className={`flex flex-col ${message.role === 'user' ? 'items-end' : 'items-start'}`}>
                              <div
                                className={`px-4 py-2 rounded-lg ${
                                  message.role === 'user'
                                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                                    : 'bg-slate-700 text-white'
                                }`}
                              >
                                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                              </div>
                              <p className="text-xs text-slate-400 mt-1">
                                {message.timestamp.toLocaleTimeString()}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                      {isChatLoading && (
                        <div className="flex justify-start">
                          <div className="flex items-start gap-2">
                            <Avatar className="w-8 h-8">
                              <AvatarFallback className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white">
                                AI
                              </AvatarFallback>
                            </Avatar>
                            <div className="bg-slate-700 text-white px-4 py-2 rounded-lg">
                              <div className="flex items-center gap-2">
                                <Loader2 className="w-4 h-4 animate-spin" />
                                <span className="text-sm">AI is thinking...</span>
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
                    placeholder="Type your message..."
                    value={chatMessage}
                    onChange={(e) => setChatMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleChatSubmit())}
                    className="flex-1 bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 focus:border-purple-500 resize-none"
                    rows={1}
                  />
                  <Button
                    onClick={handleChatSubmit}
                    disabled={!chatMessage.trim() || isChatLoading}
                    className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                  >
                    Send
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