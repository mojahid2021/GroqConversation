import { createContext, useContext, ReactNode, useState } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { apiRequest } from '@/lib/api';

interface PublicChatMessage {
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

const PublicChatContext = createContext<PublicChatContextType | undefined>(undefined);

export function PublicChatProvider({ children }: { children: ReactNode }) {
  const [messages, setMessages] = useState<PublicChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const sendMessage = async (content: string) => {
    if (!content.trim()) return;

    try {
      setIsLoading(true);

      // Add user message locally
      const userMessage: PublicChatMessage = {
        id: Date.now().toString(),
        content,
        role: 'user',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, userMessage]);

      // Send message to API
      const response = await apiRequest('POST', '/api/messages', {
        conversationId: 1, // Use default conversation for public chat
        content,
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      const data = await response.json();

      // Add AI message from response
      const aiMessage: PublicChatMessage = {
        id: data.aiMessage.id.toString(),
        content: data.aiMessage.content,
        role: 'assistant',
        timestamp: new Date(data.aiMessage.createdAt)
      };

      setMessages(prev => [...prev, aiMessage]);
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
    <PublicChatContext.Provider value={{ messages, sendMessage, isLoading }}>
      {children}
    </PublicChatContext.Provider>
  );
}

export function usePublicChat() {
  const context = useContext(PublicChatContext);
  if (context === undefined) {
    throw new Error('usePublicChat must be used within a PublicChatProvider');
  }
  return context;
}