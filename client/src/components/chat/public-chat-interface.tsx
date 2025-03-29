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

// API Key Dialog Component
function ApiKeyDialog({ 
  isOpen, 
  onClose, 
  onSave 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  onSave: (key: string) => void;
}) {
  const [apiKey, setApiKey] = useState("");

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add Groq API Key</DialogTitle>
          <DialogDescription>
            Add your Groq API key to enable AI responses in the public chat. You can get one by signing up at{" "}
            <a 
              href="https://console.groq.com/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-500 underline"
            >
              console.groq.com
            </a>
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="apiKey" className="text-right col-span-1">
              API Key
            </Label>
            <Input
              id="apiKey"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="groq_api_xxxxxxxxxxxx"
              className="col-span-3"
            />
          </div>
        </div>
        <DialogFooter>
          <Button onClick={() => onSave(apiKey)} disabled={!apiKey.trim()}>
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Custom Chat Input with API Key button
function ChatInputWithApiKey({ 
  onSendMessage, 
  isLoading, 
  onApiKeyClick,
  apiKeySet
}: { 
  onSendMessage: (content: string) => Promise<void>; 
  isLoading: boolean;
  onApiKeyClick: () => void;
  apiKeySet: boolean;
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
          onClick={onApiKeyClick}
          className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
        >
          <Key className={`h-5 w-5 ${apiKeySet ? 'text-green-500' : 'text-gray-400'}`} />
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
  const { messages, sendMessage, isLoading, apiKeySet, setApiKey } = usePublicChat();
  const [apiKeyDialogOpen, setApiKeyDialogOpen] = useState(false);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  const handleApiKeySave = (key: string) => {
    setApiKey(key);
    setApiKeyDialogOpen(false);
  };

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
              Welcome to the public chat! {apiKeySet 
                ? 'Your API key is set. Start chatting with our AI assistant.'
                : 'Click the key icon below to add your Groq API key and enable AI responses.'
              }
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
      
      {/* Chat Input with API Key button */}
      <ChatInputWithApiKey 
        onSendMessage={sendMessage} 
        isLoading={isLoading}
        onApiKeyClick={() => setApiKeyDialogOpen(true)}
        apiKeySet={apiKeySet}
      />
      
      {/* API Key Dialog */}
      <ApiKeyDialog 
        isOpen={apiKeyDialogOpen}
        onClose={() => setApiKeyDialogOpen(false)}
        onSave={handleApiKeySave}
      />
    </div>
  );
}