import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import { config } from '@/lib/config';

// Enable edge runtime for better performance
export const runtime = 'edge';
export const dynamic = 'force-dynamic';

interface ChatMessage {
  role: string;
  content: string;
}

export async function POST(request: NextRequest) {
  try {
    const { message, history = [] } = await request.json();
    
    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    // Prepare the conversation history for the API
    const messages: ChatMessage[] = [
      {
        role: 'system',
        content: 'You are a helpful AI assistant integrated into a web proxy service. You can help users with web browsing, URL analysis, content summarization, and general questions. Be concise but informative.'
      },
      ...history,
      {
        role: 'user',
        content: message
      }
    ];

    // Make request to LLM7.io API
    const response = await axios.post(
      `${config.llm7BaseUrl}/chat/completions`,
      {
        model: 'gpt-3.5-turbo', // You can change this to other available models
        messages: messages,
        max_tokens: 1000,
        temperature: 0.7,
        stream: false,
      },
      {
        headers: {
          'Authorization': `Bearer ${config.llm7ApiKey}`,
          'Content-Type': 'application/json',
        },
        timeout: 30000,
      }
    );

    const aiResponse = response.data.choices[0]?.message?.content;
    
    if (!aiResponse) {
      throw new Error('No response from AI model');
    }

    return NextResponse.json({
      response: aiResponse,
      usage: response.data.usage,
      model: response.data.model,
    });

  } catch (error) {
    console.error('Chat API error:', error);
    
    if (axios.isAxiosError(error)) {
      const status = error.response?.status || 500;
      const errorMessage = error.response?.data?.error?.message || error.message;
      
      return NextResponse.json(
        { 
          error: 'Failed to get AI response',
          details: errorMessage,
          status
        },
        { status }
      );
    }
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Health check endpoint
export async function GET() {
  try {
    // Test the LLM7.io API connection
    const response = await axios.get(`${config.llm7BaseUrl}/models`, {
      headers: {
        'Authorization': `Bearer ${config.llm7ApiKey}`,
      },
      timeout: 5000,
    });

    return NextResponse.json({
      status: 'healthy',
      llm7_connected: true,
      models_available: response.data.data?.length || 0,
    });

  } catch (error) {
    console.error('Health check error:', error);
    
    return NextResponse.json({
      status: 'unhealthy',
      llm7_connected: false,
      error: axios.isAxiosError(error) ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}
