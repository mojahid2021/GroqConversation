import { useRef, useEffect } from "react";
import { ChatInput } from "./chat-input";
import { ChatMessage } from "./chat-message";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useChat } from "@/hooks/use-chat";

interface ChatInterfaceProps {
  conversationId?: number;
  className?: string;
}

export function ChatInterface({ conversationId, className }: ChatInterfaceProps) {
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  
  const {
    conversation,
    messages,
    isLoadingConversation,
    isLoading: isSendingMessage,
    sendMessage,
  } = useChat({
    initialConversationId: conversationId,
  });

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  // Get welcome message based on conversation state
  const getWelcomeMessage = () => {
    if (isLoadingConversation) {
      return "Loading conversation...";
    }
    
    if (conversationId && messages.length === 0) {
      return "No messages in this conversation yet. Start typing to chat with Groq AI.";
    }
    
    return "Welcome to GroqChat! Upload documents or start a conversation to get started.";
  };

  return (
    <div className={`flex-1 flex flex-col bg-white h-full ${className}`}>
      {/* Chat Messages */}
      <div 
        ref={scrollAreaRef}
        className="flex-1 overflow-y-auto px-4 py-4"
      >
        {(!conversationId || messages.length === 0) && (
          <div className="chat-message mx-auto max-w-3xl mb-6 text-center">
            <p className="text-sm text-gray-500">
              {getWelcomeMessage()}
            </p>
          </div>
        )}
        
        {messages.map((message) => (
          <ChatMessage 
            key={message.id} 
            message={message} 
          />
        ))}
        
        {isSendingMessage && (
          <div className="chat-message mr-auto mb-4 flex">
            <div className="w-8 h-8 rounded-full bg-[#2D3748] flex-shrink-0 mr-2 flex items-center justify-center">
              <span className="text-white text-xs font-bold">AI</span>
            </div>
            <div className="bg-gray-100 rounded-lg px-4 py-3 text-sm flex items-center">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.4s" }}></div>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Chat Input */}
      <ChatInput 
        onSendMessage={sendMessage} 
        isLoading={isSendingMessage}
      />
    </div>
  );
}
