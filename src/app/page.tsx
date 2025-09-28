"use client";

import { useState } from "react";
import {
  Card,
  CardBody,
  CardHeader,
  Button,
  Input,
  Textarea,
  Tabs,
  Tab,
  Switch,
  Divider,
  Spinner,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
} from "@heroui/react";
import { Search, MessageCircle, Globe, Settings } from "lucide-react";
import ProxyViewer from "@/components/ProxyViewer";
import ChatMessage from "@/components/ChatMessage";

export default function Home() {
  const [url, setUrl] = useState("");
  const [proxyUrl, setProxyUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [chatMessage, setChatMessage] = useState("");
  const [chatHistory, setChatHistory] = useState<Array<{ role: string; content: string; timestamp?: Date }>>([]);
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [darkMode, setDarkMode] = useState(true);
  const [originalUrl, setOriginalUrl] = useState("");
  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  const handleProxyRequest = async () => {
    if (!url) return;
    
    setIsLoading(true);
    try {
      // This will be implemented with the backend
      const response = await fetch('/api/proxy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url }),
      });
      
      const data = await response.json();
      setProxyUrl(data.proxyUrl);
      setOriginalUrl(url);
    } catch (error) {
      console.error('Proxy request failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChatSubmit = async () => {
    if (!chatMessage.trim()) return;
    
    const userMessage = { role: 'user', content: chatMessage, timestamp: new Date() };
    setChatHistory(prev => [...prev, userMessage]);
    setChatMessage("");
    setIsChatLoading(true);
    
    try {
      // This will be implemented with LLM7.io integration
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: chatMessage, history: chatHistory }),
      });
      
      const data = await response.json();
      const aiMessage = { role: 'assistant', content: data.response, timestamp: new Date() };
      setChatHistory(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Chat request failed:', error);
    } finally {
      setIsChatLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      {/* Header */}
      <div className="container mx-auto px-4 py-6">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
              <Globe className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Saphire</h1>
              <p className="text-gray-300">Beautiful AI-powered web proxy</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Switch
              isSelected={darkMode}
              onValueChange={setDarkMode}
              color="secondary"
              thumbIcon={({ isSelected, className }) =>
                isSelected ? (
                  <div className={`${className} text-black`}>🌙</div>
                ) : (
                  <div className={`${className} text-yellow-500`}>☀️</div>
                )
              }
            />
            <Button
              isIconOnly
              variant="ghost"
              color="default"
              onPress={onOpen}
              className="text-white"
            >
              <Settings className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <Tabs
          aria-label="Options"
          color="secondary"
          variant="underlined"
          classNames={{
            tabList: "gap-6 w-full relative rounded-none p-0 border-b border-divider",
            cursor: "w-full bg-gradient-to-r from-purple-500 to-pink-500",
            tab: "max-w-fit px-0 h-12",
            tabContent: "group-data-[selected=true]:text-white",
          }}
        >
          <Tab
            key="proxy"
            title={
              <div className="flex items-center space-x-2">
                <Globe className="w-4 h-4" />
                <span>Web Proxy</span>
              </div>
            }
          >
            <Card className="mt-6 bg-white/10 backdrop-blur-md border-white/20">
              <CardHeader className="flex gap-3">
                <div className="flex flex-col">
                  <p className="text-md text-white font-semibold">Web Proxy</p>
                  <p className="text-small text-gray-300">
                    Browse the web through our secure proxy with AI enhancement
                  </p>
                </div>
              </CardHeader>
              <Divider className="bg-white/20" />
              <CardBody className="gap-4">
                <div className="flex gap-2">
                  <Input
                    type="url"
                    placeholder="Enter URL to proxy..."
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    startContent={<Search className="w-4 h-4 text-gray-400" />}
                    className="flex-1"
                    classNames={{
                      input: "text-white placeholder:text-gray-400",
                      inputWrapper: "bg-white/10 border-white/20 hover:border-white/30 focus-within:border-purple-500",
                    }}
                  />
                  <Button
                    color="secondary"
                    onPress={handleProxyRequest}
                    isLoading={isLoading}
                    className="bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold"
                  >
                    {isLoading ? <Spinner size="sm" /> : "Proxy"}
                  </Button>
                </div>
                
                {proxyUrl && originalUrl && (
                  <div className="mt-4">
                    <ProxyViewer proxyUrl={proxyUrl} originalUrl={originalUrl} />
                  </div>
                )}
              </CardBody>
            </Card>
          </Tab>

          <Tab
            key="chat"
            title={
              <div className="flex items-center space-x-2">
                <MessageCircle className="w-4 h-4" />
                <span>AI Chat</span>
              </div>
            }
          >
            <Card className="mt-6 bg-white/10 backdrop-blur-md border-white/20">
              <CardHeader className="flex gap-3">
                <div className="flex flex-col">
                  <p className="text-md text-white font-semibold">AI Assistant</p>
                  <p className="text-small text-gray-300">
                    Chat with our AI assistant powered by LLM7.io
                  </p>
                </div>
              </CardHeader>
              <Divider className="bg-white/20" />
              <CardBody className="gap-4">
                <div className="h-96 overflow-y-auto bg-black/20 rounded-lg p-4 space-y-4">
                  {chatHistory.length === 0 ? (
                    <div className="text-center text-gray-400 py-8">
                      <MessageCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>Start a conversation with the AI assistant</p>
                    </div>
                  ) : (
                    chatHistory.map((message, index) => (
                      <ChatMessage
                        key={index}
                        role={message.role}
                        content={message.content}
                        timestamp={message.timestamp}
                      />
                    ))
                  )}
                  {isChatLoading && (
                    <div className="flex justify-start">
                      <div className="bg-white/20 text-white px-4 py-2 rounded-lg">
                        <Spinner size="sm" className="mr-2" />
                        AI is thinking...
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="flex gap-2">
                  <Textarea
                    placeholder="Type your message..."
                    value={chatMessage}
                    onChange={(e) => setChatMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleChatSubmit())}
                    className="flex-1"
                    minRows={1}
                    maxRows={3}
                    classNames={{
                      input: "text-white placeholder:text-gray-400",
                      inputWrapper: "bg-white/10 border-white/20 hover:border-white/30 focus-within:border-purple-500",
                    }}
                  />
                  <Button
                    color="secondary"
                    onPress={handleChatSubmit}
                    isDisabled={!chatMessage.trim() || isChatLoading}
                    className="bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold"
                  >
                    Send
                  </Button>
                </div>
              </CardBody>
            </Card>
          </Tab>
        </Tabs>
      </div>

      {/* Settings Modal */}
      <Modal isOpen={isOpen} onOpenChange={onOpenChange} className="bg-white/10 backdrop-blur-md">
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1 text-white">
                Settings
              </ModalHeader>
              <ModalBody>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-white">Dark Mode</span>
                    <Switch
                      isSelected={darkMode}
                      onValueChange={setDarkMode}
                      color="secondary"
                    />
                  </div>
                  <Divider className="bg-white/20" />
                  <div className="text-sm text-gray-300">
                    <p className="font-semibold mb-2">API Keys:</p>
                    <p>• Google API: Configured</p>
                    <p>• LLM7.io: Configured</p>
                  </div>
                </div>
              </ModalBody>
              <ModalFooter>
                <Button color="danger" variant="light" onPress={onClose}>
                  Close
                </Button>
                <Button color="primary" onPress={onClose}>
                  Save
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
}