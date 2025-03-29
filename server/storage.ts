import {
  users, conversations, messages, documents, apiKeys, webhooks, analytics, settings,
  type User, type InsertUser,
  type Conversation, type InsertConversation,
  type Message, type InsertMessage,
  type Document, type InsertDocument,
  type ApiKey, type InsertApiKey,
  type Webhook, type InsertWebhook,
  type Analytics, type InsertAnalytics,
  type Settings, type InsertSettings
} from "@shared/schema";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Conversation operations
  getConversation(id: number): Promise<Conversation | undefined>;
  getConversationsByUserId(userId: number): Promise<Conversation[]>;
  createConversation(conversation: InsertConversation): Promise<Conversation>;
  updateConversation(id: number, conversation: Partial<Conversation>): Promise<Conversation | undefined>;
  deleteConversation(id: number): Promise<boolean>;
  
  // Message operations
  getMessage(id: number): Promise<Message | undefined>;
  getMessagesByConversationId(conversationId: number): Promise<Message[]>;
  createMessage(message: InsertMessage): Promise<Message>;
  
  // Document operations
  getDocument(id: number): Promise<Document | undefined>;
  getDocumentsByUserId(userId: number): Promise<Document[]>;
  createDocument(document: InsertDocument): Promise<Document>;
  deleteDocument(id: number): Promise<boolean>;
  
  // API Key operations
  getApiKey(id: number): Promise<ApiKey | undefined>;
  getApiKeysByUserId(userId: number): Promise<ApiKey[]>;
  createApiKey(apiKey: InsertApiKey): Promise<ApiKey>;
  updateApiKey(id: number, apiKey: Partial<ApiKey>): Promise<ApiKey | undefined>;
  deleteApiKey(id: number): Promise<boolean>;
  
  // Webhook operations
  getWebhook(id: number): Promise<Webhook | undefined>;
  getWebhooksByUserId(userId: number): Promise<Webhook[]>;
  createWebhook(webhook: InsertWebhook): Promise<Webhook>;
  updateWebhook(id: number, webhook: Partial<Webhook>): Promise<Webhook | undefined>;
  deleteWebhook(id: number): Promise<boolean>;
  
  // Analytics operations
  getAnalyticsByUserId(userId: number): Promise<Analytics[]>;
  getAnalyticsByDateRange(userId: number, startDate: Date, endDate: Date): Promise<Analytics[]>;
  createAnalytics(analytics: InsertAnalytics): Promise<Analytics>;
  
  // Settings operations
  getSettingsByUserId(userId: number): Promise<Settings | undefined>;
  createSettings(settings: InsertSettings): Promise<Settings>;
  updateSettings(userId: number, settings: Partial<Settings>): Promise<Settings | undefined>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private conversations: Map<number, Conversation>;
  private messages: Map<number, Message>;
  private documents: Map<number, Document>;
  private apiKeys: Map<number, ApiKey>;
  private webhooks: Map<number, Webhook>;
  private analytics: Map<number, Analytics>;
  private settings: Map<number, Settings>;
  
  private userIdCounter: number;
  private conversationIdCounter: number;
  private messageIdCounter: number;
  private documentIdCounter: number;
  private apiKeyIdCounter: number;
  private webhookIdCounter: number;
  private analyticsIdCounter: number;
  private settingsIdCounter: number;
  
  constructor() {
    this.users = new Map();
    this.conversations = new Map();
    this.messages = new Map();
    this.documents = new Map();
    this.apiKeys = new Map();
    this.webhooks = new Map();
    this.analytics = new Map();
    this.settings = new Map();
    
    this.userIdCounter = 1;
    this.conversationIdCounter = 1;
    this.messageIdCounter = 1;
    this.documentIdCounter = 1;
    this.apiKeyIdCounter = 1;
    this.webhookIdCounter = 1;
    this.analyticsIdCounter = 1;
    this.settingsIdCounter = 1;

    // Add a default admin user
    this.createUser({
      username: 'admin',
      password: 'password', // In a real app this would be hashed
      email: 'admin@example.com',
      role: 'admin'
    });
  }
  
  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }
  
  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username
    );
  }
  
  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email === email
    );
  }
  
  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const createdAt = new Date();
    const user: User = { ...insertUser, id, createdAt };
    this.users.set(id, user);
    return user;
  }
  
  // Conversation operations
  async getConversation(id: number): Promise<Conversation | undefined> {
    return this.conversations.get(id);
  }
  
  async getConversationsByUserId(userId: number): Promise<Conversation[]> {
    return Array.from(this.conversations.values()).filter(
      (conversation) => conversation.userId === userId
    );
  }
  
  async createConversation(insertConversation: InsertConversation): Promise<Conversation> {
    const id = this.conversationIdCounter++;
    const createdAt = new Date();
    const updatedAt = createdAt;
    const conversation: Conversation = { ...insertConversation, id, createdAt, updatedAt };
    this.conversations.set(id, conversation);
    return conversation;
  }
  
  async updateConversation(id: number, data: Partial<Conversation>): Promise<Conversation | undefined> {
    const conversation = await this.getConversation(id);
    if (!conversation) return undefined;
    
    const updatedConversation: Conversation = { 
      ...conversation, 
      ...data, 
      updatedAt: new Date() 
    };
    this.conversations.set(id, updatedConversation);
    return updatedConversation;
  }
  
  async deleteConversation(id: number): Promise<boolean> {
    return this.conversations.delete(id);
  }
  
  // Message operations
  async getMessage(id: number): Promise<Message | undefined> {
    return this.messages.get(id);
  }
  
  async getMessagesByConversationId(conversationId: number): Promise<Message[]> {
    return Array.from(this.messages.values()).filter(
      (message) => message.conversationId === conversationId
    );
  }
  
  async createMessage(insertMessage: InsertMessage): Promise<Message> {
    const id = this.messageIdCounter++;
    const createdAt = new Date();
    const message: Message = { ...insertMessage, id, createdAt };
    this.messages.set(id, message);
    return message;
  }
  
  // Document operations
  async getDocument(id: number): Promise<Document | undefined> {
    return this.documents.get(id);
  }
  
  async getDocumentsByUserId(userId: number): Promise<Document[]> {
    return Array.from(this.documents.values()).filter(
      (document) => document.userId === userId
    );
  }
  
  async createDocument(insertDocument: InsertDocument): Promise<Document> {
    const id = this.documentIdCounter++;
    const createdAt = new Date();
    const document: Document = { ...insertDocument, id, createdAt };
    this.documents.set(id, document);
    return document;
  }
  
  async deleteDocument(id: number): Promise<boolean> {
    return this.documents.delete(id);
  }
  
  // API Key operations
  async getApiKey(id: number): Promise<ApiKey | undefined> {
    return this.apiKeys.get(id);
  }
  
  async getApiKeysByUserId(userId: number): Promise<ApiKey[]> {
    return Array.from(this.apiKeys.values()).filter(
      (apiKey) => apiKey.userId === userId
    );
  }
  
  async createApiKey(insertApiKey: InsertApiKey): Promise<ApiKey> {
    const id = this.apiKeyIdCounter++;
    const createdAt = new Date();
    const apiKey: ApiKey = { ...insertApiKey, id, createdAt };
    this.apiKeys.set(id, apiKey);
    return apiKey;
  }
  
  async updateApiKey(id: number, data: Partial<ApiKey>): Promise<ApiKey | undefined> {
    const apiKey = await this.getApiKey(id);
    if (!apiKey) return undefined;
    
    const updatedApiKey: ApiKey = { ...apiKey, ...data };
    this.apiKeys.set(id, updatedApiKey);
    return updatedApiKey;
  }
  
  async deleteApiKey(id: number): Promise<boolean> {
    return this.apiKeys.delete(id);
  }
  
  // Webhook operations
  async getWebhook(id: number): Promise<Webhook | undefined> {
    return this.webhooks.get(id);
  }
  
  async getWebhooksByUserId(userId: number): Promise<Webhook[]> {
    return Array.from(this.webhooks.values()).filter(
      (webhook) => webhook.userId === userId
    );
  }
  
  async createWebhook(insertWebhook: InsertWebhook): Promise<Webhook> {
    const id = this.webhookIdCounter++;
    const createdAt = new Date();
    const webhook: Webhook = { ...insertWebhook, id, createdAt };
    this.webhooks.set(id, webhook);
    return webhook;
  }
  
  async updateWebhook(id: number, data: Partial<Webhook>): Promise<Webhook | undefined> {
    const webhook = await this.getWebhook(id);
    if (!webhook) return undefined;
    
    const updatedWebhook: Webhook = { ...webhook, ...data };
    this.webhooks.set(id, updatedWebhook);
    return updatedWebhook;
  }
  
  async deleteWebhook(id: number): Promise<boolean> {
    return this.webhooks.delete(id);
  }
  
  // Analytics operations
  async getAnalyticsByUserId(userId: number): Promise<Analytics[]> {
    return Array.from(this.analytics.values()).filter(
      (analytics) => analytics.userId === userId
    );
  }
  
  async getAnalyticsByDateRange(userId: number, startDate: Date, endDate: Date): Promise<Analytics[]> {
    return Array.from(this.analytics.values()).filter(
      (analytics) => 
        analytics.userId === userId && 
        analytics.date >= startDate && 
        analytics.date <= endDate
    );
  }
  
  async createAnalytics(insertAnalytics: InsertAnalytics): Promise<Analytics> {
    const id = this.analyticsIdCounter++;
    const date = new Date();
    const analytics: Analytics = { ...insertAnalytics, id, date };
    this.analytics.set(id, analytics);
    return analytics;
  }
  
  // Settings operations
  async getSettingsByUserId(userId: number): Promise<Settings | undefined> {
    return Array.from(this.settings.values()).find(
      (settings) => settings.userId === userId
    );
  }
  
  async createSettings(insertSettings: InsertSettings): Promise<Settings> {
    const id = this.settingsIdCounter++;
    const updatedAt = new Date();
    const settings: Settings = { ...insertSettings, id, updatedAt };
    this.settings.set(id, settings);
    return settings;
  }
  
  async updateSettings(userId: number, data: Partial<Settings>): Promise<Settings | undefined> {
    const settings = await this.getSettingsByUserId(userId);
    if (!settings) return undefined;
    
    const updatedSettings: Settings = { 
      ...settings, 
      ...data,
      updatedAt: new Date()
    };
    this.settings.set(settings.id, updatedSettings);
    return updatedSettings;
  }
}

export const storage = new MemStorage();
