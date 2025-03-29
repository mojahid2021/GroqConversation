import { createContext, useContext, useState, ReactNode } from 'react';
import { useToast } from '@/hooks/use-toast';

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

// Public chat provider component
export function PublicChatProvider({ children }: { children: ReactNode }) {
  const [messages, setMessages] = useState<PublicChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Simulate AI responses
  const generateResponse = async (userMessage: string): Promise<string> => {
    // For demonstration purposes, create a simple response
    // In a real application, this would call the Groq API directly
    const responses = [
      "Thank you for your message. This is a public chat demo that doesn't require login.",
      "I'm a simple AI assistant in the public chat interface. For full functionality, please use the admin panel.",
      "This is a demo response. In the complete version, this would use the Groq API to generate responses.",
      `I received your message: "${userMessage.substring(0, 30)}...". This is a simulated response.`,
      "For full access to the Groq API and document context features, please login to the admin panel."
    ];
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Return random response
    return responses[Math.floor(Math.random() * responses.length)];
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
      const responseContent = await generateResponse(content);
      
      // Add AI message
      const aiMessage: PublicChatMessage = {
        id: (Date.now() + 1).toString(),
        content: responseContent,
        role: 'assistant',
        timestamp: new Date()
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

// Custom hook to use the public chat context
export function usePublicChat() {
  const context = useContext(PublicChatContext);
  if (context === undefined) {
    throw new Error('usePublicChat must be used within a PublicChatProvider');
  }
  return context;
}