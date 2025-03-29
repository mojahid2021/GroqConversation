import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import axios from 'axios';

// Define message types for the public chat
export interface PublicChatMessage {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
}

interface PublicChatContextType {
  messages: PublicChatMessage[];
  sendMessage: (content: string) => Promise<void>;
  isLoading: boolean;
}

// Create context
const PublicChatContext = createContext<PublicChatContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = 'groq_public_api_key';
const LOCAL_STORAGE_MESSAGES_KEY = 'public_chat_messages';

// Model data for the Groq API
interface GroqModelInfo {
  name: string;
  tokensPerSecond: number;
  inputPrice: number;
  outputPrice: number;
}

const DEFAULT_MODEL: GroqModelInfo = {
  name: "llama3-70b-8192",
  tokensPerSecond: 330,
  inputPrice: 0.59,
  outputPrice: 0.79
};

// Public chat provider component
export function PublicChatProvider({ children }: { children: ReactNode }) {
  const [messages, setMessages] = useState<PublicChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Load messages from localStorage on init
  useEffect(() => {
    try {
      const savedMessages = localStorage.getItem(LOCAL_STORAGE_MESSAGES_KEY);
      if (savedMessages) {
        const parsedMessages = JSON.parse(savedMessages);
        // Convert timestamp strings back to Date objects
        const messagesWithDates = parsedMessages.map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        }));
        setMessages(messagesWithDates);
      }
    } catch (error) {
      console.error('Failed to load saved messages:', error);
    }
  }, []);

  // Save messages to localStorage when they change
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem(LOCAL_STORAGE_MESSAGES_KEY, JSON.stringify(messages));
    }
  }, [messages]);

  // Generate response using system-configured API
  const generateAIResponse = async (userMessage: string): Promise<string> => {
    try {
      // Use the server-side endpoint that uses admin API key
      const response = await axios({
        method: 'post',
        url: '/api/chat',
        headers: {
          'Content-Type': 'application/json'
        },
        data: {
          messages: [
            ...messages.map(msg => ({
              role: msg.role,
              content: msg.content
            })),
            { role: 'user', content: userMessage }
          ],
          model: DEFAULT_MODEL.name
        }
      });
      
      if (response.data && response.data.reply) {
        return response.data.reply;
      } else {
        throw new Error("Invalid response from AI service");
      }
    } catch (error) {
      console.error('Error calling AI service:', error);
      if (axios.isAxiosError(error) && error.response) {
        return `Error: ${error.response.data.error || 'Unknown error from AI service'}`;
      }
      return "Failed to connect to the AI service. Please try again later.";
    }
  };

  // Send message function
  const sendMessage = async (content: string) => {
    if (!content.trim()) return;
    
    try {
      setIsLoading(true);
      
      // Add user message
      const userMessage: PublicChatMessage = {
        id: Date.now().toString(),
        content,
        role: 'user',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, userMessage]);
      
      // Generate AI response
      const responseContent = await generateAIResponse(content);
      
      // Add AI message
      const aiMessage: PublicChatMessage = {
        id: (Date.now() + 1).toString(),
        content: responseContent,
        role: 'assistant',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, aiMessage]);
      
      // Notify webhooks through server
      try {
        await fetch('/api/public/webhook/notify', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userMessage: content,
            aiMessage: responseContent
          }),
        });
      } catch (error) {
        console.error('Failed to notify webhook:', error);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to send message",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <PublicChatContext.Provider value={{ 
      messages, 
      sendMessage, 
      isLoading
    }}>
      {children}
    </PublicChatContext.Provider>
  );
}

// Custom hook to use the public chat context
export function usePublicChat() {
  const context = useContext(PublicChatContext);
  if (context === undefined) {
    throw new Error('usePublicChat must be used within a PublicChatProvider');
  }
  return context;
}