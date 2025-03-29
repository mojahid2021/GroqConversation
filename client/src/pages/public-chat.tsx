import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PublicChatInterface } from "@/components/chat/public-chat-interface";
import { PublicChatProvider } from "@/lib/public-chat";
import { PublicHeader } from "@/components/layout/public-header";

export default function PublicChat() {
  return (
    <div className="flex flex-col min-h-screen bg-[#F7FAFC]">
      <PublicHeader />

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