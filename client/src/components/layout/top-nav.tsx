import { useState } from "react";
import { Link } from "wouter";
import { cn } from "@/lib/utils";
import { Menu, Bell, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useMutation } from "@tanstack/react-query";
import { createConversation } from "@/lib/groq-api";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { SmartSearch } from "@/components/search/smart-search";

interface TopNavProps {
  onToggleSidebar: () => void;
  className?: string;
}

export function TopNav({ onToggleSidebar, className }: TopNavProps) {
  const { toast } = useToast();
  
  const { mutate: newChat, isPending } = useMutation({
    mutationFn: () => createConversation({ title: "New Conversation" }),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/conversations"] });
      window.location.href = `/chat/${data.id}`;
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create new chat",
        variant: "destructive",
      });
    },
  });

  return (
    <header className={cn("bg-white border-b border-gray-200", className)}>
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center md:hidden">
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleSidebar}
            className="text-gray-500 hover:text-gray-600"
          >
            <Menu className="h-5 w-5" />
          </Button>
          <h1 className="ml-3 font-inter font-bold text-lg text-[#2D3748]">GroqChat</h1>
        </div>
        
        <div className="hidden md:flex items-center space-x-4">
          <SmartSearch />
          <Button
            onClick={() => newChat()}
            disabled={isPending}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-[#805AD5] hover:bg-[#805AD5]/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#805AD5]"
          >
            <Plus className="mr-2 h-4 w-4" />
            New Chat
          </Button>
        </div>
        
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="icon"
            className="text-gray-500 hover:text-gray-600"
          >
            <Bell className="h-5 w-5" />
          </Button>
          <div className="relative">
            <Button
              variant="ghost"
              className="flex items-center focus:outline-none md:hidden"
            >
              <div className="w-8 h-8 rounded-full bg-[#805AD5] flex items-center justify-center">
                <span className="text-white text-sm font-bold">AD</span>
              </div>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
