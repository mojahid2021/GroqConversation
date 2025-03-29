import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Paperclip, Send } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  isLoading?: boolean;
  className?: string;
}

export function ChatInput({ onSendMessage, isLoading = false, className }: ChatInputProps) {
  const [message, setMessage] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Resize textarea as user types
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [message]);

  // Handle form submission
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!message.trim() || isLoading) return;
    
    onSendMessage(message);
    setMessage("");
    
    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  // Handle keyboard shortcuts
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Submit on Enter without Shift
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (!message.trim() || isLoading) return;
      
      onSendMessage(message);
      setMessage("");
      
      // Reset textarea height
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
      }
    }
  };

  return (
    <div className={`border-t border-gray-200 px-4 py-3 bg-white ${className}`}>
      <form onSubmit={handleSubmit} className="flex items-end">
        <div className="flex-1 mr-2">
          <div className="relative rounded-lg border border-gray-300 bg-white overflow-hidden focus-within:border-[#805AD5] focus-within:ring-1 focus-within:ring-[#805AD5]">
            <Textarea
              ref={textareaRef}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type your message..."
              className="min-h-[44px] max-h-[200px] resize-none border-0 py-3 px-3 focus-visible:ring-0 text-sm"
              disabled={isLoading}
            />
            <div className="absolute bottom-2 right-2 flex space-x-2">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="text-gray-400 hover:text-gray-600"
                title="Upload file"
                disabled={isLoading}
              >
                <Paperclip className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
        <Button
          type="submit"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-[#805AD5] hover:bg-[#805AD5]/90 focus:outline-none"
          disabled={!message.trim() || isLoading}
        >
          <span>Send</span>
          <Send className="ml-2 h-4 w-4" />
        </Button>
      </form>
    </div>
  );
}
