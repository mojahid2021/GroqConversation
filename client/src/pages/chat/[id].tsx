import { useState, useEffect } from "react";
import { useParams } from "wouter";
import { MainLayout } from "@/components/layout/main-layout";
import { ChatInterface } from "@/components/chat/chat-interface";
import { DocumentSidebar } from "@/components/layout/document-sidebar";
import { Button } from "@/components/ui/button";
import { useChat } from "@/hooks/use-chat";
import { PanelRightOpen } from "lucide-react";

interface ChatConversationProps {
  id?: string;
}

export default function ChatConversation({ id }: ChatConversationProps = {}) {
  const params = useParams();
  const conversationId = id ? parseInt(id) : params.id ? parseInt(params.id) : undefined;
  const [documentSidebarOpen, setDocumentSidebarOpen] = useState(false);
  
  const {
    setConversationId,
    selectedDocumentIds,
    toggleDocumentSelection,
  } = useChat({ initialConversationId: conversationId });

  // Update conversation ID when the param changes
  useEffect(() => {
    if (conversationId) {
      setConversationId(conversationId);
    }
  }, [conversationId, setConversationId]);

  return (
    <MainLayout>
      <div className="flex h-full">
        {/* Chat Area */}
        <div className="flex-1 flex flex-col relative">
          <ChatInterface conversationId={conversationId} />
          
          {/* Document sidebar toggle button */}
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 md:hidden"
            onClick={() => setDocumentSidebarOpen(true)}
          >
            <PanelRightOpen className="h-5 w-5" />
          </Button>
        </div>
        
        {/* Document Context Sidebar - hidden on mobile, visible on md screens and up */}
        <DocumentSidebar 
          className="hidden md:flex"
          selectedDocumentIds={selectedDocumentIds}
          onToggleDocument={toggleDocumentSelection}
          onClose={() => setDocumentSidebarOpen(false)}
        />
        
        {/* Mobile Document Sidebar - conditionally shown */}
        {documentSidebarOpen && (
          <div className="fixed inset-0 z-50 md:hidden">
            {/* Overlay */}
            <div 
              className="fixed inset-0 bg-gray-600 bg-opacity-75"
              onClick={() => setDocumentSidebarOpen(false)}
            />
            
            {/* Sidebar */}
            <div className="fixed inset-y-0 right-0 z-50">
              <DocumentSidebar
                selectedDocumentIds={selectedDocumentIds}
                onToggleDocument={toggleDocumentSelection}
                onClose={() => setDocumentSidebarOpen(false)}
              />
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
