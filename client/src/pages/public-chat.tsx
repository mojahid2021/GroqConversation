import { useState } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Settings } from "lucide-react";
import { PublicChatInterface } from "@/components/chat/public-chat-interface";
import { PublicChatProvider } from "@/lib/public-chat";

export default function PublicChat() {
  const [, setLocation] = useLocation();

  return (
    <div className="flex flex-col min-h-screen bg-[#F7FAFC]">
      <header className="bg-white border-b border-gray-200 py-3 px-6 flex justify-between items-center">
        <div className="flex items-center">
          <h1 className="text-xl font-bold text-[#2D3748]">GroqChat</h1>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="text-gray-600"
          onClick={() => setLocation("/admin/login")}
        >
          <Settings className="h-4 w-4 mr-2" />
          Admin Panel
        </Button>
      </header>

      <main className="flex-1 p-6 max-w-6xl mx-auto w-full">
        <Card className="shadow-sm h-[calc(100vh-8rem)]">
          <CardHeader className="px-6 py-4 border-b border-gray-200">
            <CardTitle>Public Chat</CardTitle>
          </CardHeader>
          <CardContent className="p-0 h-[calc(100%-4rem)]">
            <PublicChatProvider>
              <PublicChatInterface />
            </PublicChatProvider>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}