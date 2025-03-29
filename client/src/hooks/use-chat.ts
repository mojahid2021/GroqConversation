import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { 
  sendMessage, 
  createConversation, 
  Message, 
  ConversationWithMessages 
} from "@/lib/groq-api";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";

interface UseChatProps {
  initialConversationId?: number;
}

export function useChat({ initialConversationId }: UseChatProps = {}) {
  const [conversationId, setConversationId] = useState<number | undefined>(initialConversationId);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedDocumentIds, setSelectedDocumentIds] = useState<number[]>([]);
  const { toast } = useToast();

  // Fetch conversation with messages
  const {
    data: conversation,
    isLoading: isLoadingConversation,
    error: conversationError,
  } = useQuery({
    queryKey: conversationId ? [`/api/conversations/${conversationId}`] : [],
    enabled: !!conversationId,
  });

  // Send message mutation
  const { mutate: sendMessageMutation } = useMutation({
    mutationFn: sendMessage,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ 
        queryKey: [`/api/conversations/${conversationId}`] 
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to send message",
        variant: "destructive",
      });
    },
  });

  // Create conversation mutation
  const { mutate: createConversationMutation } = useMutation({
    mutationFn: createConversation,
    onSuccess: (data) => {
      setConversationId(data.id);
      queryClient.invalidateQueries({ queryKey: ["/api/conversations"] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create conversation",
        variant: "destructive",
      });
    },
  });

  // Handle sending a message
  const handleSendMessage = async (content: string) => {
    if (!content.trim()) return;

    setIsLoading(true);

    try {
      // If no conversation exists, create a new one
      if (!conversationId) {
        // Generate a title from the first message
        const title = content.length > 30 
          ? `${content.substring(0, 30)}...` 
          : content;
        
        createConversationMutation({ title });
        return;
      }

      // Send message to existing conversation
      sendMessageMutation({
        conversationId,
        content,
        documentIds: selectedDocumentIds.length > 0 ? selectedDocumentIds : undefined,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to send message",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Toggle document selection
  const toggleDocumentSelection = (documentId: number) => {
    setSelectedDocumentIds((prev) => {
      if (prev.includes(documentId)) {
        return prev.filter(id => id !== documentId);
      } else {
        return [...prev, documentId];
      }
    });
  };

  return {
    conversationId,
    setConversationId,
    conversation: conversation as ConversationWithMessages | undefined,
    messages: (conversation as ConversationWithMessages)?.messages || [],
    isLoadingConversation,
    conversationError,
    isLoading,
    selectedDocumentIds,
    toggleDocumentSelection,
    sendMessage: handleSendMessage,
  };
}
