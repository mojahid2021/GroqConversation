import { useRef, useEffect, useState } from "react";
import { ChatInput } from "./chat-input";
import { usePublicChat, PublicChatMessage } from "@/lib/public-chat";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Key, MoreHorizontal } from "lucide-react";

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

// Webhook Info Dialog Component
function WebhookInfoDialog({ 
  isOpen, 
  onClose
}: { 
  isOpen: boolean; 
  onClose: () => void; 
}) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>About Public Chat Webhooks</DialogTitle>
          <DialogDescription>
            This public chat is connected through system-generated webhooks. Administrators can configure webhooks in the admin panel.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <p className="text-sm mb-2">Webhooks allow:</p>
          <ul className="text-sm list-disc pl-5 space-y-1">
            <li>Real-time notifications when messages are sent</li>
            <li>Integration with external systems</li>
            <li>Automated responses from other services</li>
          </ul>
        </div>
        <DialogFooter>
          <Button onClick={onClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Custom Chat Input with webhook info button
function ChatInputWithWebhook({ 
  onSendMessage, 
  isLoading, 
  onWebhookInfoClick
}: { 
  onSendMessage: (content: string) => Promise<void>; 
  isLoading: boolean;
  onWebhookInfoClick: () => void;
}) {
  const [inputValue, setInputValue] = useState("");
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim() && !isLoading) {
      onSendMessage(inputValue);
      setInputValue("");
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="border-t border-gray-200 p-4 flex items-end gap-2">
      <div className="relative flex-1">
        <Input
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Type your message here..."
          className="pr-10"
          disabled={isLoading}
        />
        <button
          type="button"
          onClick={onWebhookInfoClick}
          className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
        >
          <MoreHorizontal className="h-5 w-5" />
        </button>
      </div>
      <Button type="submit" disabled={!inputValue.trim() || isLoading}>
        Send
      </Button>
    </form>
  );
}

// Public chat interface component
export function PublicChatInterface({ className }: { className?: string }) {
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const { messages, sendMessage, isLoading } = usePublicChat();
  const [webhookInfoOpen, setWebhookInfoOpen] = useState(false);

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
              Welcome to the public chat! Start chatting with our AI assistant.
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
      
      {/* Chat Input with Webhook Info button */}
      <ChatInputWithWebhook 
        onSendMessage={sendMessage} 
        isLoading={isLoading}
        onWebhookInfoClick={() => setWebhookInfoOpen(true)}
      />
      
      {/* Webhook Info Dialog */}
      <WebhookInfoDialog 
        isOpen={webhookInfoOpen}
        onClose={() => setWebhookInfoOpen(false)}
      />
    </div>
  );
}