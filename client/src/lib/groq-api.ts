import { queryClient, apiRequest } from "./queryClient";

// Token counting helper (approximate)
export function countTokens(text: string): number {
  // Simple approximation: 1 token ≈ 4 characters
  return Math.ceil(text.length / 4);
}

// Calculate cost in cents (approximate)
export function calculateCost(tokens: number): number {
  // Approximate cost: $0.001 per 1k tokens (0.1 cents per 1k tokens)
  return Math.ceil((tokens / 1000) * 0.1);
}

interface SendMessageArgs {
  conversationId: number;
  content: string;
  documentIds?: number[];
}

export interface ConversationWithMessages {
  id: number;
  title: string;
  userId: number;
  createdAt: string;
  updatedAt: string;
  messages: Message[];
}

export interface Message {
  id: number;
  conversationId: number;
  content: string;
  role: "user" | "assistant";
  documentReference?: string | null;
  tokenCount?: number | null;
  createdAt: string;
}

export interface MessageResponse {
  userMessage: Message;
  aiMessage: Message;
}

export async function sendMessage({
  conversationId,
  content,
  documentIds,
}: SendMessageArgs): Promise<MessageResponse> {
  const response = await apiRequest("POST", "/api/messages", {
    conversationId,
    content,
    documentIds,
  });
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Failed to send message");
  }
  
  const data = await response.json();
  
  // Invalidate conversation query to update with new messages
  queryClient.invalidateQueries({ queryKey: [`/api/conversations/${conversationId}`] });
  
  return data;
}

export interface CreateConversationArgs {
  title: string;
}

export interface Conversation {
  id: number;
  title: string;
  userId: number;
  createdAt: string;
  updatedAt: string;
}

export async function createConversation({ 
  title 
}: CreateConversationArgs): Promise<Conversation> {
  const response = await apiRequest("POST", "/api/conversations", { title });
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Failed to create conversation");
  }
  
  const data = await response.json();
  
  // Invalidate conversations list
  queryClient.invalidateQueries({ queryKey: ["/api/conversations"] });
  
  return data;
}

export async function deleteConversation(id: number): Promise<void> {
  const response = await apiRequest("DELETE", `/api/conversations/${id}`, undefined);
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Failed to delete conversation");
  }
  
  // Invalidate conversations list
  queryClient.invalidateQueries({ queryKey: ["/api/conversations"] });
}

export interface Document {
  id: number;
  name: string;
  userId: number;
  type: string;
  size: number;
  createdAt: string;
}

export async function uploadDocument(file: File): Promise<Document> {
  const formData = new FormData();
  formData.append("file", file);
  
  // Get the userId from localStorage for authentication
  const userId = localStorage.getItem('userId');
  
  const response = await fetch("/api/documents", {
    method: "POST",
    headers: {
      // Cannot include Content-Type with FormData as the browser sets it automatically
      'user-id': userId || ''
    },
    body: formData,
    credentials: "include",
  });
  
  if (!response.ok) {
    let errorMessage = "Failed to upload document";
    try {
      const errorData = await response.json();
      errorMessage = errorData.message || errorMessage;
    } catch (e) {
      // If response cannot be parsed as JSON, use the statusText
      errorMessage = response.statusText || errorMessage;
    }
    throw new Error(errorMessage);
  }
  
  const data = await response.json();
  
  // Invalidate documents list
  queryClient.invalidateQueries({ queryKey: ["/api/documents"] });
  
  return data;
}

export async function deleteDocument(id: number): Promise<void> {
  const response = await apiRequest("DELETE", `/api/documents/${id}`, undefined);
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Failed to delete document");
  }
  
  // Invalidate documents list
  queryClient.invalidateQueries({ queryKey: ["/api/documents"] });
}

export interface ApiKey {
  id: number;
  name: string;
  key: string;
  userId: number;
  active: boolean;
  createdAt: string;
}

export interface CreateApiKeyArgs {
  name: string;
  key: string;
}

export async function createApiKey({
  name,
  key,
}: CreateApiKeyArgs): Promise<ApiKey> {
  const response = await apiRequest("POST", "/api/api-keys", { name, key });
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Failed to create API key");
  }
  
  const data = await response.json();
  
  // Invalidate API keys list
  queryClient.invalidateQueries({ queryKey: ["/api/api-keys"] });
  
  return data;
}

export async function updateApiKey(id: number, active: boolean): Promise<ApiKey> {
  const response = await apiRequest("PATCH", `/api/api-keys/${id}`, { active });
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Failed to update API key");
  }
  
  const data = await response.json();
  
  // Invalidate API keys list
  queryClient.invalidateQueries({ queryKey: ["/api/api-keys"] });
  
  return data;
}

export async function deleteApiKey(id: number): Promise<void> {
  const response = await apiRequest("DELETE", `/api/api-keys/${id}`, undefined);
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Failed to delete API key");
  }
  
  // Invalidate API keys list
  queryClient.invalidateQueries({ queryKey: ["/api/api-keys"] });
}

export interface Webhook {
  id: number;
  name: string;
  url: string;
  userId: number;
  active: boolean;
  createdAt: string;
}

export interface CreateWebhookArgs {
  name: string;
  url: string;
}

export async function createWebhook({
  name,
  url,
}: CreateWebhookArgs): Promise<Webhook> {
  const response = await apiRequest("POST", "/api/webhooks", { name, url });
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Failed to create webhook");
  }
  
  const data = await response.json();
  
  // Invalidate webhooks list
  queryClient.invalidateQueries({ queryKey: ["/api/webhooks"] });
  
  return data;
}

export async function updateWebhook(id: number, data: Partial<Webhook>): Promise<Webhook> {
  const response = await apiRequest("PATCH", `/api/webhooks/${id}`, data);
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Failed to update webhook");
  }
  
  const responseData = await response.json();
  
  // Invalidate webhooks list
  queryClient.invalidateQueries({ queryKey: ["/api/webhooks"] });
  
  return responseData;
}

export async function deleteWebhook(id: number): Promise<void> {
  const response = await apiRequest("DELETE", `/api/webhooks/${id}`, undefined);
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Failed to delete webhook");
  }
  
  // Invalidate webhooks list
  queryClient.invalidateQueries({ queryKey: ["/api/webhooks"] });
}

export interface Analytics {
  id: number;
  userId: number;
  tokensUsed: number;
  cost: number;
  date: string;
}

export interface AnalyticsSummary {
  analytics: Analytics[];
  summary: {
    totalTokens: number;
    totalCost: number;
    count: number;
  };
}

export interface Settings {
  id: number;
  userId: number;
  groqApiKey?: string;
  defaultModel: string;
  maxTokens: number;
  temperature: number;
  theme: string;
  updatedAt: string;
}

export async function updateSettings(data: Partial<Settings>): Promise<Settings> {
  const response = await apiRequest("PATCH", "/api/settings", data);
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Failed to update settings");
  }
  
  const responseData = await response.json();
  
  // Invalidate settings
  queryClient.invalidateQueries({ queryKey: ["/api/settings"] });
  
  return responseData;
}
