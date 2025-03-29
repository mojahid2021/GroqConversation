import {
  users, conversations, messages, documents, apiKeys, webhooks, analytics, settings,
  badges, userBadges, userAchievements,
  type User, type InsertUser,
  type Conversation, type InsertConversation,
  type Message, type InsertMessage,
  type Document, type InsertDocument,
  type ApiKey, type InsertApiKey,
  type Webhook, type InsertWebhook,
  type Analytics, type InsertAnalytics,
  type Settings, type InsertSettings,
  type Badge, type InsertBadge,
  type UserBadge, type InsertUserBadge,
  type UserAchievement, type InsertUserAchievement
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
  updateAnalytics(id: number, analytics: Partial<Analytics>): Promise<Analytics | undefined>;
  
  // Settings operations
  getSettingsByUserId(userId: number): Promise<Settings | undefined>;
  createSettings(settings: InsertSettings): Promise<Settings>;
  updateSettings(userId: number, settings: Partial<Settings>): Promise<Settings | undefined>;
  
  // Badge operations
  getBadge(id: number): Promise<Badge | undefined>;
  getAllBadges(): Promise<Badge[]>;
  createBadge(badge: InsertBadge): Promise<Badge>;
  
  // User Badge operations
  getUserBadge(id: number): Promise<UserBadge | undefined>;
  getUserBadgesByUserId(userId: number): Promise<UserBadge[]>;
  createUserBadge(userBadge: InsertUserBadge): Promise<UserBadge>;
  
  // User Achievement operations
  getUserAchievement(id: number): Promise<UserAchievement | undefined>;
  getUserAchievementsByUserId(userId: number): Promise<UserAchievement[]>;
  getUserAchievementByType(userId: number, type: string): Promise<UserAchievement | undefined>;
  createUserAchievement(userAchievement: InsertUserAchievement): Promise<UserAchievement>;
  updateUserAchievement(id: number, userAchievement: Partial<UserAchievement>): Promise<UserAchievement | undefined>;
  incrementUserAchievement(userId: number, type: string, amount?: number): Promise<UserAchievement>;
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
  private badges: Map<number, Badge>;
  private userBadges: Map<number, UserBadge>;
  private userAchievements: Map<number, UserAchievement>;
  
  private userIdCounter: number;
  private conversationIdCounter: number;
  private messageIdCounter: number;
  private documentIdCounter: number;
  private apiKeyIdCounter: number;
  private webhookIdCounter: number;
  private analyticsIdCounter: number;
  private settingsIdCounter: number;
  private badgeIdCounter: number;
  private userBadgeIdCounter: number;
  private userAchievementIdCounter: number;
  
  constructor() {
    this.users = new Map();
    this.conversations = new Map();
    this.messages = new Map();
    this.documents = new Map();
    this.apiKeys = new Map();
    this.webhooks = new Map();
    this.analytics = new Map();
    this.settings = new Map();
    this.badges = new Map();
    this.userBadges = new Map();
    this.userAchievements = new Map();
    
    this.userIdCounter = 1;
    this.conversationIdCounter = 1;
    this.messageIdCounter = 1;
    this.documentIdCounter = 1;
    this.apiKeyIdCounter = 1;
    this.webhookIdCounter = 1;
    this.analyticsIdCounter = 1;
    this.settingsIdCounter = 1;
    this.badgeIdCounter = 1;
    this.userBadgeIdCounter = 1;
    this.userAchievementIdCounter = 1;

    // Add a default admin user
    this.createUser({
      username: 'admin',
      password: 'admin123', // Matches the password in auth-context
      email: 'admin@example.com',
      role: 'admin'
    });
    
    // We'll add default badges later in a setup function to avoid constructor issues
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
    // Ensure role property is always defined
    const user: User = { 
      ...insertUser, 
      id, 
      createdAt,
      role: insertUser.role || 'user' // Default to 'user' if role is not provided
    };
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
    const message: Message = { 
      ...insertMessage, 
      id, 
      createdAt,
      // Ensure required properties have non-undefined values
      documentReference: insertMessage.documentReference ?? null,
      tokenCount: insertMessage.tokenCount ?? null
    };
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
    const apiKey: ApiKey = { 
      ...insertApiKey, 
      id, 
      createdAt,
      active: insertApiKey.active !== undefined ? insertApiKey.active : true
    };
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
    const webhook: Webhook = { 
      ...insertWebhook, 
      id, 
      createdAt,
      active: insertWebhook.active !== undefined ? insertWebhook.active : true
    };
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
      (analytics) => {
        // Only include analytics where date is not null and is in the range
        if (analytics.userId !== userId || analytics.date === null) {
          return false;
        }
        return analytics.date >= startDate && analytics.date <= endDate;
      }
    );
  }
  
  async createAnalytics(insertAnalytics: InsertAnalytics): Promise<Analytics> {
    const id = this.analyticsIdCounter++;
    const date = new Date();
    const analytics: Analytics = { ...insertAnalytics, id, date };
    this.analytics.set(id, analytics);
    return analytics;
  }
  
  async updateAnalytics(id: number, data: Partial<Analytics>): Promise<Analytics | undefined> {
    const analytics = this.analytics.get(id);
    if (!analytics) return undefined;
    
    const updatedAnalytics: Analytics = { ...analytics, ...data };
    this.analytics.set(id, updatedAnalytics);
    return updatedAnalytics;
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
    const settings: Settings = { 
      ...insertSettings, 
      id, 
      updatedAt,
      // Ensure all required fields have default values
      groqApiKey: insertSettings.groqApiKey ?? null,
      defaultModel: insertSettings.defaultModel ?? 'llama3-8b-8192',
      maxTokens: insertSettings.maxTokens ?? 4096,
      temperature: insertSettings.temperature ?? 70, // default 0.7 * 100
      theme: insertSettings.theme ?? 'light'
    };
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

  // Badge operations
  async getBadge(id: number): Promise<Badge | undefined> {
    return this.badges.get(id);
  }

  async getAllBadges(): Promise<Badge[]> {
    return Array.from(this.badges.values());
  }

  async createBadge(insertBadge: InsertBadge): Promise<Badge> {
    const id = this.badgeIdCounter++;
    const createdAt = new Date().toISOString();
    const badge: Badge = { ...insertBadge, id, createdAt };
    this.badges.set(id, badge);
    return badge;
  }

  // User Badge operations
  async getUserBadge(id: number): Promise<UserBadge | undefined> {
    return this.userBadges.get(id);
  }

  async getUserBadgesByUserId(userId: number): Promise<UserBadge[]> {
    return Array.from(this.userBadges.values()).filter(
      (userBadge) => userBadge.userId === userId
    );
  }

  async createUserBadge(insertUserBadge: InsertUserBadge): Promise<UserBadge> {
    const id = this.userBadgeIdCounter++;
    const earnedAt = new Date().toISOString();
    const userBadge: UserBadge = { ...insertUserBadge, id, earnedAt };
    this.userBadges.set(id, userBadge);
    return userBadge;
  }

  // User Achievement operations
  async getUserAchievement(id: number): Promise<UserAchievement | undefined> {
    return this.userAchievements.get(id);
  }

  async getUserAchievementsByUserId(userId: number): Promise<UserAchievement[]> {
    return Array.from(this.userAchievements.values()).filter(
      (userAchievement) => userAchievement.userId === userId
    );
  }

  async getUserAchievementByType(userId: number, type: string): Promise<UserAchievement | undefined> {
    return Array.from(this.userAchievements.values()).find(
      (userAchievement) => userAchievement.userId === userId && userAchievement.type === type
    );
  }

  async createUserAchievement(insertUserAchievement: InsertUserAchievement): Promise<UserAchievement> {
    const id = this.userAchievementIdCounter++;
    const updatedAt = new Date().toISOString();
    const userAchievement: UserAchievement = { 
      ...insertUserAchievement, 
      id, 
      updatedAt,
      // Ensure count has a default value if not provided
      count: insertUserAchievement.count || 0 
    };
    this.userAchievements.set(id, userAchievement);
    return userAchievement;
  }

  async updateUserAchievement(id: number, data: Partial<UserAchievement>): Promise<UserAchievement | undefined> {
    const userAchievement = await this.getUserAchievement(id);
    if (!userAchievement) return undefined;
    
    const updatedUserAchievement: UserAchievement = { 
      ...userAchievement, 
      ...data,
      updatedAt: new Date().toISOString()
    };
    this.userAchievements.set(id, updatedUserAchievement);
    return updatedUserAchievement;
  }

  async incrementUserAchievement(userId: number, type: string, amount: number = 1): Promise<UserAchievement> {
    // Find existing achievement or create a new one
    let achievement = await this.getUserAchievementByType(userId, type);
    
    if (achievement) {
      // Update existing achievement
      achievement.count += amount;
      achievement.updatedAt = new Date().toISOString();
      this.userAchievements.set(achievement.id, achievement);
    } else {
      // Create new achievement
      achievement = await this.createUserAchievement({
        userId,
        type,
        count: amount
      });
    }
    
    // Check if user has earned any badges based on this achievement
    const badges = await this.getAllBadges();
    for (const badge of badges) {
      if (badge.criteria === type && achievement.count >= badge.threshold) {
        // Check if user already has this badge
        const existingBadges = await this.getUserBadgesByUserId(userId);
        const hasBadge = existingBadges.some(ub => ub.badgeId === badge.id);
        
        if (!hasBadge) {
          // Award new badge
          await this.createUserBadge({
            userId,
            badgeId: badge.id
          });
        }
      }
    }
    
    return achievement;
  }
}

export const storage = new MemStorage();

// Initialize default badges
async function initializeDefaultBadges() {
  // Create default badges
  await storage.createBadge({
    name: 'Conversation Starter',
    description: 'Started your first conversation',
    icon: 'MessageSquare',
    criteria: 'conversations',
    threshold: 1
  });
  
  await storage.createBadge({
    name: 'Chat Enthusiast',
    description: 'Sent 10 messages',
    icon: 'MessageCircle',
    criteria: 'messages',
    threshold: 10
  });
  
  await storage.createBadge({
    name: 'Document Master',
    description: 'Uploaded 5 documents',
    icon: 'FileText',
    criteria: 'documents',
    threshold: 5
  });
  
  await storage.createBadge({
    name: 'API Developer',
    description: 'Created an API key',
    icon: 'Key',
    criteria: 'api_keys',
    threshold: 1
  });
  
  await storage.createBadge({
    name: 'Integration Expert',
    description: 'Set up a webhook',
    icon: 'Webhook',
    criteria: 'webhooks',
    threshold: 1
  });

  console.log('Default badges initialized');
}

// Call the initialization function
initializeDefaultBadges();
