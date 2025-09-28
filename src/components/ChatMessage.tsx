"use client";

import { Avatar } from "@heroui/react";
import { User, Cpu } from "lucide-react";

interface ChatMessageProps {
  role: string;
  content: string;
  timestamp?: Date;
}

export default function ChatMessage({ role, content, timestamp }: ChatMessageProps) {
  const isUser = role === 'user';
  
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
      <div className={`flex max-w-xs lg:max-w-md ${isUser ? 'flex-row-reverse' : 'flex-row'} items-start gap-2`}>
        <Avatar
          icon={isUser ? <User className="w-4 h-4" /> : <Cpu className="w-4 h-4" />}
          className={`w-8 h-8 ${
            isUser 
              ? 'bg-gradient-to-r from-purple-500 to-pink-500' 
              : 'bg-gradient-to-r from-blue-500 to-cyan-500'
          }`}
        />
        <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
          <div
            className={`px-4 py-2 rounded-lg ${
              isUser
                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                : 'bg-white/20 text-white backdrop-blur-sm'
            }`}
          >
            <p className="text-sm whitespace-pre-wrap">{content}</p>
          </div>
          {timestamp && (
            <p className="text-xs text-gray-400 mt-1">
              {timestamp.toLocaleTimeString()}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
