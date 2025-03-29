import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import multer from "multer";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import axios from "axios";
import pdfParse from "../lib/pdf-parse-wrapper";
import {
  insertUserSchema,
  insertConversationSchema,
  insertMessageSchema,
  insertDocumentSchema,
  insertApiKeySchema,
  insertWebhookSchema,
  insertAnalyticsSchema,
  insertSettingsSchema
} from "@shared/schema";

// Setup file uploads
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsDir = path.join(__dirname, "../uploads");

// Create uploads directory if it doesn't exist
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage_multer = multer.diskStorage({
  destination: function (req: any, file: any, cb: any) {
    cb(null, uploadsDir);
  },
  filename: function (req: any, file: any, cb: any) {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({
  storage: storage_multer,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB max file size
  },
  fileFilter: (req: any, file: any, cb: any) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(null, false);
      return cb(new Error('Only PDF files are allowed'));
    }
  }
});

// Helper for token counting (approximate)
function countTokens(text: string): number {
  // Simple approximation: 1 token ≈ 4 characters
  return Math.ceil(text.length / 4);
}

// Helper to calculate cost in cents (approximate)
function calculateCost(tokens: number): number {
  // Approximate cost: $0.001 per 1k tokens (0.1 cents per 1k tokens)
  return Math.ceil((tokens / 1000) * 0.1);
}

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);

  // Add user authentication middleware
  const authenticate = async (req: Request, res: Response, next: NextFunction) => {
    // Simple auth for demo - in a real app this would use JWT/session
    const userId = req.headers['user-id'];
    
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    try {
      const userIdNum = Number(userId);
      const user = await storage.getUser(userIdNum);
      
      if (!user) {
        // If user with ID 1 doesn't exist (admin), create it 
        if (userIdNum === 1) {
          const adminUser = await storage.createUser({
            username: 'admin',
            password: 'admin123', // Matches the password in auth-context
            email: 'admin@example.com',
            role: 'admin'
          });
          req.body.user = adminUser;
          return next();
        }
        return res.status(401).json({ message: "User not found" });
      }
      
      req.body.user = user;
      next();
    } catch (error) {
      console.error("Authentication error:", error);
      return res.status(500).json({ message: "Authentication failed" });
    }
  };

  // User Routes
  app.post('/api/register', async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await storage.getUserByUsername(userData.username);
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }
      
      const user = await storage.createUser(userData);
      
      // Create default webhook
      await storage.createWebhook({
        userId: user.id,
        name: "Default Notifications",
        url: `https://notifications.${user.username}.replit.app/webhook`,
        active: false // Disabled by default for safety
      });

      // Don't send password in response
      const { password, ...userResponse } = user;
      
      return res.status(201).json(userResponse);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors });
      }
      return res.status(500).json({ message: "Server error" });
    }
  });

  app.post('/api/login', async (req, res) => {
    try {
      const { username, password } = req.body;
      
      if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
      }
      
      const user = await storage.getUserByUsername(username);
      if (!user || user.password !== password) { // In a real app, use proper password hashing
        return res.status(401).json({ message: "Invalid credentials" });
      }
      
      // Don't send password in response
      const { password: _, ...userResponse } = user;
      
      return res.status(200).json(userResponse);
    } catch (error) {
      return res.status(500).json({ message: "Server error" });
    }
  });

  // Conversation Routes
  app.get('/api/conversations', authenticate, async (req, res) => {
    try {
      const userId = req.body.user.id;
      const conversations = await storage.getConversationsByUserId(userId);
      return res.status(200).json(conversations);
    } catch (error) {
      return res.status(500).json({ message: "Server error" });
    }
  });

  app.post('/api/conversations', authenticate, async (req, res) => {
    try {
      const userId = req.body.user.id;
      const conversationData = insertConversationSchema.parse({ ...req.body, userId });
      
      const conversation = await storage.createConversation(conversationData);
      return res.status(201).json(conversation);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors });
      }
      return res.status(500).json({ message: "Server error" });
    }
  });

  app.get('/api/conversations/:id', authenticate, async (req, res) => {
    try {
      const conversationId = Number(req.params.id);
      const userId = req.body.user.id;
      
      const conversation = await storage.getConversation(conversationId);
      if (!conversation || conversation.userId !== userId) {
        return res.status(404).json({ message: "Conversation not found" });
      }
      
      const messages = await storage.getMessagesByConversationId(conversationId);
      return res.status(200).json({ ...conversation, messages });
    } catch (error) {
      return res.status(500).json({ message: "Server error" });
    }
  });

  app.delete('/api/conversations/:id', authenticate, async (req, res) => {
    try {
      const conversationId = Number(req.params.id);
      const userId = req.body.user.id;
      
      const conversation = await storage.getConversation(conversationId);
      if (!conversation || conversation.userId !== userId) {
        return res.status(404).json({ message: "Conversation not found" });
      }
      
      await storage.deleteConversation(conversationId);
      return res.status(204).end();
    } catch (error) {
      return res.status(500).json({ message: "Server error" });
    }
  });

  // Messages Routes
  app.post('/api/messages', authenticate, async (req, res) => {
    try {
      const userId = req.body.user.id;
      const { conversationId, content, documentIds } = req.body;
      
      // Validate conversation exists and belongs to user
      const conversation = await storage.getConversation(Number(conversationId));
      if (!conversation || conversation.userId !== userId) {
        return res.status(404).json({ message: "Conversation not found" });
      }
      
      // Create user message
      const userMessage = await storage.createMessage({
        conversationId: Number(conversationId),
        content,
        role: 'user',
        tokenCount: countTokens(content)
      });
      
      // Get user settings
      let settings = await storage.getSettingsByUserId(userId);
      if (!settings) {
        // Create default settings if they don't exist
        settings = await storage.createSettings({
          userId,
          groqApiKey: process.env.GROQ_API_KEY || "",
          defaultModel: "llama3-8b-8192",
          maxTokens: 4096,
          temperature: 70, // 0.7 * 100
          theme: "light"
        });
      }
      
      // Prepare context from documents if provided
      let documentContext = "";
      if (documentIds && documentIds.length > 0) {
        for (const docId of documentIds) {
          const document = await storage.getDocument(Number(docId));
          if (document && document.userId === userId) {
            documentContext += `\n\nDocument: ${document.name}\nContent: ${document.content}\n`;
          }
        }
      }
      
      // Prepare messages for Groq API
      const previousMessages = await storage.getMessagesByConversationId(Number(conversationId));
      const messageHistory = previousMessages
        .filter(msg => msg.id !== userMessage.id) // Exclude the just created message
        .slice(-10) // Limit history to last 10 messages
        .map(msg => ({
          role: msg.role,
          content: msg.content
        }));
      
      // API key from settings or environment variable
      const apiKey = settings.groqApiKey || process.env.GROQ_API_KEY;
      if (!apiKey) {
        return res.status(400).json({ message: "Groq API key not found" });
      }
      
      try {
        // Call Groq API
        const response = await axios.post(
          'https://api.groq.com/openai/v1/chat/completions',
          {
            model: settings.defaultModel,
            messages: [
              ...messageHistory,
              { role: "user", content: documentContext ? `${content}\n\nReference the following documents for context:\n${documentContext}` : content }
            ],
            max_tokens: settings.maxTokens,
            temperature: (settings.temperature || 70) / 100
          },
          {
            headers: {
              'Authorization': `Bearer ${apiKey}`,
              'Content-Type': 'application/json'
            }
          }
        );
        
        // Extract AI response
        const aiResponse = response.data.choices[0].message.content;
        const aiTokenCount = response.data.usage.completion_tokens;
        
        // Save AI message to database
        const aiMessage = await storage.createMessage({
          conversationId: Number(conversationId),
          content: aiResponse,
          role: 'assistant',
          documentReference: documentIds?.length ? documentIds.join(',') : undefined,
          tokenCount: aiTokenCount
        });
        
        // Track token usage for analytics
        const totalTokens = response.data.usage.total_tokens;
        await storage.createAnalytics({
          userId,
          tokensUsed: totalTokens,
          cost: calculateCost(totalTokens)
        });
        
        // Send webhooks if configured
        const webhooks = await storage.getWebhooksByUserId(userId);
        const activeWebhooks = webhooks.filter(webhook => webhook.active);
        
        for (const webhook of activeWebhooks) {
          try {
            await axios.post(webhook.url, {
              message: aiResponse,
              conversationId,
              timestamp: new Date().toISOString()
            });
          } catch (webhookError) {
            console.error(`Webhook to ${webhook.url} failed:`, webhookError);
          }
        }
        
        // Return both messages to the client
        return res.status(200).json({
          userMessage,
          aiMessage
        });
      } catch (apiError: any) {
        console.error('Groq API error:', apiError.response?.data || apiError.message);
        return res.status(500).json({ message: "AI service error", error: apiError.response?.data?.error?.message || "Unknown error" });
      }
    } catch (error) {
      console.error('Message error:', error);
      return res.status(500).json({ message: "Server error" });
    }
  });

  // Document Routes
  app.get('/api/documents', authenticate, async (req, res) => {
    try {
      const userId = req.body.user.id;
      const documents = await storage.getDocumentsByUserId(userId);
      return res.status(200).json(documents);
    } catch (error) {
      return res.status(500).json({ message: "Server error" });
    }
  });

  app.post('/api/documents', authenticate, upload.single('file'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }
      
      const userId = req.body.user.id;
      const { originalname, path: filePath, size, mimetype } = req.file;
      
      // Process PDF file
      let content = "";
      try {
        const dataBuffer = fs.readFileSync(filePath);
        const pdfData = await pdfParse(dataBuffer);
        content = pdfData.text;
      } catch (pdfError) {
        console.error("PDF parsing error:", pdfError);
        return res.status(400).json({ message: "Failed to parse PDF file" });
      }
      
      try {
        // Save document to storage
        const document = await storage.createDocument({
          name: originalname, // Use original filename instead of generated one
          userId,
          content,
          type: mimetype,
          size: Math.ceil(size / 1024) // Convert bytes to KB
        });
        
        return res.status(201).json(document);
      } catch (storageError) {
        console.error("Storage error:", storageError);
        return res.status(500).json({ message: "Failed to save document" });
      }
    } catch (error) {
      console.error("Document upload error:", error);
      return res.status(500).json({ message: "Server error" });
    }
  });

  app.delete('/api/documents/:id', authenticate, async (req, res) => {
    try {
      const documentId = Number(req.params.id);
      const userId = req.body.user.id;
      
      const document = await storage.getDocument(documentId);
      if (!document || document.userId !== userId) {
        return res.status(404).json({ message: "Document not found" });
      }
      
      await storage.deleteDocument(documentId);
      return res.status(204).end();
    } catch (error) {
      return res.status(500).json({ message: "Server error" });
    }
  });

  // API Key Routes
  app.get('/api/api-keys', authenticate, async (req, res) => {
    try {
      const userId = req.body.user.id;
      const apiKeys = await storage.getApiKeysByUserId(userId);
      return res.status(200).json(apiKeys);
    } catch (error) {
      return res.status(500).json({ message: "Server error" });
    }
  });

  app.post('/api/api-keys', authenticate, async (req, res) => {
    try {
      const userId = req.body.user.id;
      const apiKeyData = insertApiKeySchema.parse({ ...req.body, userId });
      
      const apiKey = await storage.createApiKey(apiKeyData);
      return res.status(201).json(apiKey);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors });
      }
      return res.status(500).json({ message: "Server error" });
    }
  });

  app.patch('/api/api-keys/:id', authenticate, async (req, res) => {
    try {
      const apiKeyId = Number(req.params.id);
      const userId = req.body.user.id;
      
      const apiKey = await storage.getApiKey(apiKeyId);
      if (!apiKey || apiKey.userId !== userId) {
        return res.status(404).json({ message: "API key not found" });
      }
      
      const updatedApiKey = await storage.updateApiKey(apiKeyId, req.body);
      return res.status(200).json(updatedApiKey);
    } catch (error) {
      return res.status(500).json({ message: "Server error" });
    }
  });

  app.delete('/api/api-keys/:id', authenticate, async (req, res) => {
    try {
      const apiKeyId = Number(req.params.id);
      const userId = req.body.user.id;
      
      const apiKey = await storage.getApiKey(apiKeyId);
      if (!apiKey || apiKey.userId !== userId) {
        return res.status(404).json({ message: "API key not found" });
      }
      
      await storage.deleteApiKey(apiKeyId);
      return res.status(204).end();
    } catch (error) {
      return res.status(500).json({ message: "Server error" });
    }
  });

  // Webhook Routes
  app.get('/api/webhooks', authenticate, async (req, res) => {
    try {
      const userId = req.body.user.id;
      const webhooks = await storage.getWebhooksByUserId(userId);
      return res.status(200).json(webhooks);
    } catch (error) {
      return res.status(500).json({ message: "Server error" });
    }
  });

  app.post('/api/webhooks', authenticate, async (req, res) => {
    try {
      const userId = req.body.user.id;
      const webhookData = insertWebhookSchema.parse({ ...req.body, userId });
      
      const webhook = await storage.createWebhook(webhookData);
      return res.status(201).json(webhook);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors });
      }
      return res.status(500).json({ message: "Server error" });
    }
  });

  app.patch('/api/webhooks/:id', authenticate, async (req, res) => {
    try {
      const webhookId = Number(req.params.id);
      const userId = req.body.user.id;
      
      const webhook = await storage.getWebhook(webhookId);
      if (!webhook || webhook.userId !== userId) {
        return res.status(404).json({ message: "Webhook not found" });
      }
      
      const updatedWebhook = await storage.updateWebhook(webhookId, req.body);
      return res.status(200).json(updatedWebhook);
    } catch (error) {
      return res.status(500).json({ message: "Server error" });
    }
  });

  app.delete('/api/webhooks/:id', authenticate, async (req, res) => {
    try {
      const webhookId = Number(req.params.id);
      const userId = req.body.user.id;
      
      const webhook = await storage.getWebhook(webhookId);
      if (!webhook || webhook.userId !== userId) {
        return res.status(404).json({ message: "Webhook not found" });
      }
      
      await storage.deleteWebhook(webhookId);
      return res.status(204).end();
    } catch (error) {
      return res.status(500).json({ message: "Server error" });
    }
  });

  // Analytics Routes
  app.get('/api/analytics', authenticate, async (req, res) => {
    try {
      const userId = req.body.user.id;
      
      // Query params for date range filtering
      const startDate = req.query.startDate ? new Date(req.query.startDate as string) : new Date(0);
      const endDate = req.query.endDate ? new Date(req.query.endDate as string) : new Date();
      
      const analytics = await storage.getAnalyticsByDateRange(userId, startDate, endDate);
      
      // Aggregate data
      const totalTokens = analytics.reduce((sum, entry) => sum + entry.tokensUsed, 0);
      const totalCost = analytics.reduce((sum, entry) => sum + entry.cost, 0);
      
      return res.status(200).json({
        analytics,
        summary: {
          totalTokens,
          totalCost: totalCost / 100, // Convert cents to dollars
          count: analytics.length
        }
      });
    } catch (error) {
      return res.status(500).json({ message: "Server error" });
    }
  });

  // Settings Routes
  app.get('/api/settings', authenticate, async (req, res) => {
    try {
      const userId = req.body.user.id;
      let settings = await storage.getSettingsByUserId(userId);
      
      if (!settings) {
        // Create default settings
        settings = await storage.createSettings({
          userId,
          groqApiKey: process.env.GROQ_API_KEY || "",
          defaultModel: "llama3-8b-8192",
          maxTokens: 4096,
          temperature: 70,
          theme: "light"
        });
      }
      
      return res.status(200).json(settings);
    } catch (error) {
      return res.status(500).json({ message: "Server error" });
    }
  });

  app.patch('/api/settings', authenticate, async (req, res) => {
    try {
      const userId = req.body.user.id;
      let settings = await storage.getSettingsByUserId(userId);
      
      if (!settings) {
        // Create settings if they don't exist
        settings = await storage.createSettings({
          userId,
          ...req.body
        });
        return res.status(201).json(settings);
      }
      
      // Update existing settings
      const updatedSettings = await storage.updateSettings(userId, req.body);
      return res.status(200).json(updatedSettings);
    } catch (error) {
      return res.status(500).json({ message: "Server error" });
    }
  });

  return httpServer;
}
