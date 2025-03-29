import { useRef, useEffect } from "react";
import { ChatInput } from "./chat-input";
import { usePublicChat, PublicChatMessage } from "@/lib/public-chat";

// Public chat message component
function PublicChatMessageBubble({ message }: { message: PublicChatMessage }) {
  const isUser = message.role === "user";
  
  return (
    <div className={`chat-message mb-4 flex ${isUser ? "justify-end" : "justify-start"}`}>
      {!isUser && (
        <div className="w-8 h-8 rounded-full bg-[#2D3748] flex-shrink-0 mr-2 flex items-center justify-center">
          <span className="text-white text-xs font-bold">AI</span>
        </div>
      )}
      
      <div 
        className={`px-4 py-3 text-sm max-w-[70%] rounded-lg ${
          isUser 
            ? "bg-[#805AD5] text-white" 
            : "bg-gray-100 text-gray-800"
        }`}
      >
        {message.content}
      </div>
      
      {isUser && (
        <div className="w-8 h-8 rounded-full bg-gray-400 flex-shrink-0 ml-2 flex items-center justify-center">
          <span className="text-white text-xs font-bold">You</span>
        </div>
      )}
    </div>
  );
}

// Public chat interface component
export function PublicChatInterface({ className }: { className?: string }) {
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const { messages, sendMessage, isLoading } = usePublicChat();

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div className={`flex-1 flex flex-col bg-white h-full ${className}`}>
      {/* Chat Messages */}
      <div 
        ref={scrollAreaRef}
        className="flex-1 overflow-y-auto px-4 py-4"
      >
        {messages.length === 0 && (
          <div className="chat-message mx-auto max-w-3xl mb-6 text-center">
            <p className="text-sm text-gray-500">
              Welcome to the public chat! No login required. Start typing to chat with our AI assistant.
            </p>
          </div>
        )}
        
        {messages.map((message) => (
          <PublicChatMessageBubble 
            key={message.id} 
            message={message} 
          />
        ))}
        
        {isLoading && (
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
        isLoading={isLoading}
      />
    </div>
  );
}