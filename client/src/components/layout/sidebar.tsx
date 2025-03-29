import { useState } from "react";
import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import {
  MessageSquare,
  FileText,
  BarChart2,
  Zap,
  Settings,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useQuery } from "@tanstack/react-query";
import { Conversation } from "@/lib/groq-api";

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const [location] = useLocation();
  const [isConversationsOpen, setIsConversationsOpen] = useState(true);

  // Fetch conversations
  const { data: conversations, isLoading } = useQuery<Conversation[]>({
    queryKey: ["/api/conversations"],
  });

  return (
    <div className={cn("flex flex-col w-64 bg-[#2D3748] text-white h-full", className)}>
      <div className="p-4 border-b border-gray-700">
        <h1 className="font-inter font-bold text-xl">GroqChat</h1>
      </div>
      
      <ScrollArea className="flex-1 px-3 py-2">
        <div className="space-y-1 py-2">
          <Link href="/admin/chat">
            <Button
              variant="ghost"
              className={cn(
                "w-full justify-start text-white hover:bg-[#4A5568] hover:bg-opacity-60 rounded-lg",
                location === "/admin/chat" && "bg-[#4A5568] bg-opacity-60"
              )}
            >
              <MessageSquare className="mr-3 h-5 w-5" />
              Chat
            </Button>
          </Link>
          
          <Button
            variant="ghost"
            className="w-full justify-between text-white hover:bg-[#4A5568] hover:bg-opacity-60 rounded-lg"
            onClick={() => setIsConversationsOpen(!isConversationsOpen)}
          >
            <span className="flex items-center">
              <MessageSquare className="mr-3 h-5 w-5" />
              Conversations
            </span>
            {isConversationsOpen ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </Button>
          
          {isConversationsOpen && (
            <div className="ml-9 space-y-1 mt-1">
              {isLoading ? (
                <div className="text-sm text-gray-400">Loading...</div>
              ) : conversations?.length ? (
                conversations.map((conversation) => (
                  <Link 
                    key={conversation.id} 
                    href={`/admin/chat/${conversation.id}`}
                  >
                    <Button
                      variant="ghost"
                      size="sm"
                      className={cn(
                        "w-full justify-start text-gray-300 hover:text-white hover:bg-[#4A5568] hover:bg-opacity-40",
                        location === `/admin/chat/${conversation.id}` && "bg-[#4A5568] bg-opacity-40 text-white"
                      )}
                    >
                      {conversation.title.length > 25
                        ? `${conversation.title.substring(0, 25)}...`
                        : conversation.title}
                    </Button>
                  </Link>
                ))
              ) : (
                <div className="text-sm text-gray-400">No conversations yet</div>
              )}
            </div>
          )}
          
          <Link href="/admin/documents">
            <Button
              variant="ghost"
              className={cn(
                "w-full justify-start text-white hover:bg-[#4A5568] hover:bg-opacity-60 rounded-lg",
                location === "/admin/documents" && "bg-[#4A5568] bg-opacity-60"
              )}
            >
              <FileText className="mr-3 h-5 w-5" />
              Documents
            </Button>
          </Link>
          
          <Link href="/admin/analytics">
            <Button
              variant="ghost"
              className={cn(
                "w-full justify-start text-white hover:bg-[#4A5568] hover:bg-opacity-60 rounded-lg",
                location === "/admin/analytics" && "bg-[#4A5568] bg-opacity-60"
              )}
            >
              <BarChart2 className="mr-3 h-5 w-5" />
              Analytics
            </Button>
          </Link>
          
          <Link href="/admin/webhooks">
            <Button
              variant="ghost"
              className={cn(
                "w-full justify-start text-white hover:bg-[#4A5568] hover:bg-opacity-60 rounded-lg",
                location === "/admin/webhooks" && "bg-[#4A5568] bg-opacity-60"
              )}
            >
              <Zap className="mr-3 h-5 w-5" />
              Webhooks
            </Button>
          </Link>
          
          <Link href="/admin/settings">
            <Button
              variant="ghost"
              className={cn(
                "w-full justify-start text-white hover:bg-[#4A5568] hover:bg-opacity-60 rounded-lg",
                location === "/admin/settings" && "bg-[#4A5568] bg-opacity-60"
              )}
            >
              <Settings className="mr-3 h-5 w-5" />
              Settings
            </Button>
          </Link>
        </div>
      </ScrollArea>
      
      <div className="p-4 border-t border-gray-700">
        <div className="flex items-center">
          <div className="w-8 h-8 rounded-full bg-[#805AD5] flex items-center justify-center">
            <span className="text-white text-sm font-bold">AD</span>
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium">Admin User</p>
            <p className="text-xs text-gray-400">admin@example.com</p>
          </div>
        </div>
      </div>
    </div>
  );
}
