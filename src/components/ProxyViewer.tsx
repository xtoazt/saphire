"use client";

import { useState } from "react";
import { Card, CardBody, Button, Spinner, Chip } from "@heroui/react";
import { ExternalLink, RefreshCw } from "lucide-react";

interface ProxyViewerProps {
  proxyUrl: string;
  originalUrl: string;
}

export default function ProxyViewer({ proxyUrl, originalUrl }: ProxyViewerProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleOpenProxy = () => {
    setIsLoading(true);
    setError(null);
    
    // Open the proxy URL in a new tab
    const newWindow = window.open(proxyUrl, '_blank', 'noopener,noreferrer');
    
    if (!newWindow) {
      setError('Failed to open proxy window. Please check your popup blocker settings.');
    }
    
    setIsLoading(false);
  };

  const handleRefresh = () => {
    setIsLoading(true);
    setError(null);
    
    // Reload the current page to refresh the proxy
    window.location.reload();
  };

  return (
    <Card className="bg-white/10 backdrop-blur-md border-white/20">
      <CardBody className="gap-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-white mb-2">Proxy Ready</h3>
            <Chip color="success" variant="flat" size="sm">
              Active
            </Chip>
          </div>
          <div className="flex gap-2">
            <Button
              isIconOnly
              variant="ghost"
              color="default"
              onPress={handleRefresh}
              isLoading={isLoading}
              className="text-white"
            >
              <RefreshCw className="w-4 h-4" />
            </Button>
            <Button
              color="secondary"
              onPress={handleOpenProxy}
              isLoading={isLoading}
              className="bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold"
              startContent={!isLoading && <ExternalLink className="w-4 h-4" />}
            >
              {isLoading ? <Spinner size="sm" /> : "Open Proxy"}
            </Button>
          </div>
        </div>
        
        {error && (
          <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-3">
            <p className="text-red-300 text-sm">{error}</p>
          </div>
        )}
        
        <div className="space-y-2">
          <div>
            <p className="text-sm text-gray-300 mb-1">Original URL:</p>
            <code className="text-blue-400 text-xs break-all bg-black/20 p-2 rounded block">
              {originalUrl}
            </code>
          </div>
          <div>
            <p className="text-sm text-gray-300 mb-1">Proxy URL:</p>
            <code className="text-green-400 text-xs break-all bg-black/20 p-2 rounded block">
              {proxyUrl}
            </code>
          </div>
        </div>
        
        <div className="bg-blue-500/20 border border-blue-500/30 rounded-lg p-3">
          <p className="text-blue-300 text-sm">
            💡 <strong>Tip:</strong> The proxy will handle all requests and maintain the original website&apos;s functionality while adding security and AI enhancements.
          </p>
        </div>
      </CardBody>
    </Card>
  );
}
