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
  apiKeySet: boolean;
  setApiKey: (key: string) => void;
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
  const [apiKey, setApiKey] = useState<string | null>(null);
  const { toast } = useToast();

  // Load messages and API key from localStorage on init
  useEffect(() => {
    // Load API key
    const savedApiKey = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (savedApiKey) {
      setApiKey(savedApiKey);
    }
    
    // Load messages
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

  // Create webhook when API key is added
  useEffect(() => {
    if (apiKey) {
      // Store API key in localStorage
      localStorage.setItem(LOCAL_STORAGE_KEY, apiKey);
      
      // Create a webhook for this user (based on a hash of the API key)
      const createWebhook = async () => {
        try {
          // Create a simple hash of the API key for identification
          const apiKeyHash = Array.from(apiKey)
            .reduce((hash, char) => ((hash << 5) - hash) + char.charCodeAt(0), 0)
            .toString(16);
          
          // Generate webhook URL
          const webhookName = `Public Chat Notifications`;
          const webhookUrl = `https://webhook.site/${apiKeyHash.substring(0, 8)}`;
          
          // Register the webhook with the server
          await fetch('/api/public/webhook', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              name: webhookName,
              url: webhookUrl,
              key: apiKey
            }),
          });
          
          toast({
            title: "Webhook Created",
            description: "A webhook has been automatically created for your API key",
          });
        } catch (error) {
          console.error('Failed to create webhook:', error);
        }
      };
      
      createWebhook();
    }
  }, [apiKey, toast]);

  // Send request to Groq API
  const generateGroqResponse = async (userMessage: string): Promise<string> => {
    if (!apiKey) {
      return "Please add your Groq API key to enable AI responses. Click the key icon in the chat input area.";
    }
    
    try {
      const response = await axios({
        method: 'post',
        url: 'https://api.groq.com/openai/v1/chat/completions',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        data: {
          model: DEFAULT_MODEL.name,
          messages: [
            ...messages.map(msg => ({
              role: msg.role,
              content: msg.content
            })),
            { role: 'user', content: userMessage }
          ],
          temperature: 0.7,
          max_tokens: 1024
        }
      });
      
      if (response.data && response.data.choices && response.data.choices.length > 0) {
        return response.data.choices[0].message.content;
      } else {
        throw new Error("Invalid response from Groq API");
      }
    } catch (error) {
      console.error('Error calling Groq API:', error);
      if (axios.isAxiosError(error) && error.response) {
        if (error.response.status === 401) {
          // Clear invalid API key
          localStorage.removeItem(LOCAL_STORAGE_KEY);
          setApiKey(null);
          return "Invalid API key. Please add a valid Groq API key to continue.";
        }
        return `Error: ${error.response.data.error?.message || 'Unknown error from Groq API'}`;
      }
      return "Failed to connect to the Groq API. Please try again later.";
    }
  };

  // Fallback for when API key is not set
  const generateFallbackResponse = async (userMessage: string): Promise<string> => {
    const responses = [
      "Please add your Groq API key to enable AI responses. Click the key icon in the chat input area.",
      "This chat requires a Groq API key to function. Please add one using the key icon below.",
      "To continue, please add a Groq API key. You can get one at https://console.groq.com",
      "The chat is in demo mode. Add your Groq API key to enable full functionality."
    ];
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
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
      const responseContent = apiKey 
        ? await generateGroqResponse(content)
        : await generateFallbackResponse(content);
      
      // Add AI message
      const aiMessage: PublicChatMessage = {
        id: (Date.now() + 1).toString(),
        content: responseContent,
        role: 'assistant',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, aiMessage]);
      
      // Send notification to webhook if applicable
      if (apiKey) {
        try {
          await fetch('/api/public/notify', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              userMessage: content,
              aiMessage: responseContent,
              key: apiKey
            }),
          });
        } catch (error) {
          console.error('Failed to notify webhook:', error);
        }
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

  // Set API key function
  const handleSetApiKey = (key: string) => {
    if (key && key.trim()) {
      setApiKey(key.trim());
      toast({
        title: "API Key Added",
        description: "Your Groq API key has been added successfully",
      });
    }
  };

  return (
    <PublicChatContext.Provider value={{ 
      messages, 
      sendMessage, 
      isLoading, 
      apiKeySet: !!apiKey,
      setApiKey: handleSetApiKey 
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