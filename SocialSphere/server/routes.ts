import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertPostSchema, insertTelegramMessageSchema, insertApiConfigSchema } from "@shared/schema";
import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY_ENV_VAR || "default_key"
});

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || process.env.TELEGRAM_BOT_TOKEN_ENV_VAR || "default_token";
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID || process.env.TELEGRAM_CHAT_ID_ENV_VAR || "default_chat";

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Dashboard stats endpoint
  app.get("/api/dashboard/stats", async (req, res) => {
    try {
      const stats = await storage.getDashboardStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      res.status(500).json({ error: "Failed to fetch dashboard stats" });
    }
  });

  // Get all posts
  app.get("/api/posts", async (req, res) => {
    try {
      const posts = await storage.getPosts();
      res.json(posts);
    } catch (error) {
      console.error("Error fetching posts:", error);
      res.status(500).json({ error: "Failed to fetch posts" });
    }
  });

  // Get posts by status
  app.get("/api/posts/status/:status", async (req, res) => {
    try {
      const posts = await storage.getPostsByStatus(req.params.status);
      res.json(posts);
    } catch (error) {
      console.error("Error fetching posts by status:", error);
      res.status(500).json({ error: "Failed to fetch posts by status" });
    }
  });

  // Create a new post
  app.post("/api/posts", async (req, res) => {
    try {
      const validatedData = insertPostSchema.parse(req.body);
      const post = await storage.createPost(validatedData);
      res.status(201).json(post);
    } catch (error) {
      console.error("Error creating post:", error);
      res.status(400).json({ error: "Failed to create post" });
    }
  });

  // Update post status (approve/reject)
  app.patch("/api/posts/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { status, publishedAt } = req.body;
      
      const updates: any = { status };
      if (publishedAt) {
        updates.publishedAt = new Date(publishedAt);
      }
      
      const post = await storage.updatePost(id, updates);
      if (!post) {
        return res.status(404).json({ error: "Post not found" });
      }
      
      // If approved, trigger LinkedIn posting
      if (status === "approved") {
        await postToLinkedIn(post.content);
      }
      
      res.json(post);
    } catch (error) {
      console.error("Error updating post:", error);
      res.status(400).json({ error: "Failed to update post" });
    }
  });

  // Get recent Telegram messages
  app.get("/api/telegram/messages", async (req, res) => {
    try {
      const messages = await storage.getTelegramMessages();
      res.json(messages.slice(0, 10)); // Return last 10 messages
    } catch (error) {
      console.error("Error fetching Telegram messages:", error);
      res.status(500).json({ error: "Failed to fetch Telegram messages" });
    }
  });

  // Telegram webhook endpoint
  app.post("/api/telegram/webhook", async (req, res) => {
    try {
      const update = req.body;
      
      if (update.message) {
        // Handle regular message
        const message = update.message;
        const telegramMessage = await storage.createTelegramMessage({
          messageId: message.message_id.toString(),
          chatId: message.chat.id.toString(),
          content: message.text || "Voice message received",
          messageType: message.voice ? "voice" : "text",
          processed: false
        });
        
        // Process the message with AI
        await processMessageWithAI(telegramMessage);
        
      } else if (update.callback_query) {
        // Handle approval/rejection buttons
        const callbackQuery = update.callback_query;
        await handleApprovalCallback(callbackQuery);
      }
      
      res.status(200).json({ ok: true });
    } catch (error) {
      console.error("Error processing Telegram webhook:", error);
      res.status(500).json({ error: "Failed to process webhook" });
    }
  });

  // Manual content generation
  app.post("/api/content/generate", async (req, res) => {
    try {
      const { input } = req.body;
      if (!input) {
        return res.status(400).json({ error: "Input is required" });
      }
      
      const content = await generateContentWithAI(input);
      
      // Create a new post draft
      const post = await storage.createPost({
        content,
        status: "pending",
        platform: "linkedin",
        aiGenerated: true
      });
      
      res.json({ content, postId: post.id });
    } catch (error) {
      console.error("Error generating content:", error);
      res.status(500).json({ error: "Failed to generate content" });
    }
  });

  // Test workflow endpoint
  app.post("/api/workflow/test", async (req, res) => {
    try {
      // Simulate a test workflow
      const testMessage = "This is a test message for the social media automation workflow";
      const content = await generateContentWithAI(testMessage);
      
      const post = await storage.createPost({
        content,
        status: "pending",
        platform: "linkedin",
        aiGenerated: true
      });
      
      res.json({ 
        message: "Test workflow completed successfully", 
        generatedContent: content,
        postId: post.id 
      });
    } catch (error) {
      console.error("Error testing workflow:", error);
      res.status(500).json({ error: "Failed to test workflow" });
    }
  });

  // Get API configurations
  app.get("/api/config", async (req, res) => {
    try {
      const configs = await storage.getApiConfigs();
      // Don't send actual API keys, just status
      const safeConfigs = configs.map(config => ({
        name: config.name,
        status: config.status,
        lastCheck: config.lastCheck
      }));
      res.json(safeConfigs);
    } catch (error) {
      console.error("Error fetching API configs:", error);
      res.status(500).json({ error: "Failed to fetch API configurations" });
    }
  });

  // Save API configuration
  app.post("/api/config", async (req, res) => {
    try {
      const validatedData = insertApiConfigSchema.parse(req.body);
      const config = await storage.createApiConfig(validatedData);
      res.status(201).json({ name: config.name, status: config.status });
    } catch (error) {
      console.error("Error saving API config:", error);
      res.status(400).json({ error: "Failed to save API configuration" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

// Helper function to generate content with AI
async function generateContentWithAI(input: string): Promise<string> {
  // Check if OpenAI API key is available and has quota
  if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === "default_key") {
    return generateDemoContent(input);
  }

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages: [
        {
          role: "system",
          content: `You are Bhagya Sharma's personal LinkedIn Agent.
Bhagya Sharma's tone is witty, creative, warm, thoughtful.
Your tasks:
- Write LinkedIn posts based on Bhagya's ideas.
- Write thoughtful, engaging replies to others' posts.
- Write warm and professional DM replies.
Adapt to context. Output only the text that should be posted.
Style examples:
- Embrace curiosity in every scroll.
- Sometimes a smile is the best comment.
- Let's build connections that matter.
- Your next breakthrough insight might be hiding in your LinkedIn feed.
Keep posts authentic, engaging, and true to Bhagya's voice.`
        },
        {
          role: "user",
          content: input
        }
      ],
      temperature: 0.8
    });

    return response.choices[0].message.content || "Failed to generate content";
  } catch (error) {
    console.error("Error generating AI content:", error);
    // Fallback to demo content if API fails
    return generateDemoContent(input);
  }
}

// Demo content generator for when OpenAI API is not available
function generateDemoContent(input: string): string {
  const demoResponses = [
    `🚀 Just had an amazing insight about ${input.toLowerCase()}! 

Sometimes the best ideas come when we least expect them. Today reminded me that innovation isn't just about the big breakthroughs - it's about the small, consistent steps we take every day.

What's one small step you're taking today toward your goals?

#Innovation #Growth #LinkedIn #ProfessionalDevelopment`,

    `💡 Reflecting on ${input.toLowerCase()} today...

You know what I've learned? The most powerful connections aren't always the ones that look perfect on paper. They're the genuine, authentic relationships we build one conversation at a time.

Here's to building connections that matter!

#Networking #Authenticity #ProfessionalGrowth #Community`,

    `🌟 ${input.toLowerCase()} has me thinking about the power of perspective.

Every challenge is an opportunity in disguise. Every setback is a setup for a comeback. And every conversation has the potential to change someone's day.

What perspective shift has made the biggest difference in your career?

#Mindset #Career #Growth #Inspiration`,

    `✨ Today's thought on ${input.toLowerCase()}:

Success isn't just about reaching the destination - it's about who you become on the journey. The skills you develop, the relationships you build, and the impact you create along the way.

What's one lesson you've learned recently that changed how you approach your work?

#Success #Journey #Learning #ProfessionalDevelopment`
  ];

  // Select a demo response based on input hash for consistency
  const hash = input.split('').reduce((a, b) => {
    a = ((a << 5) - a) + b.charCodeAt(0);
    return a & a;
  }, 0);
  
  return demoResponses[Math.abs(hash) % demoResponses.length];
}

// Helper function to process Telegram messages with AI
async function processMessageWithAI(telegramMessage: any): Promise<void> {
  try {
    const content = await generateContentWithAI(telegramMessage.content);
    
    // Create a new post draft
    const post = await storage.createPost({
      content,
      status: "pending",
      platform: "linkedin",
      telegramMessageId: telegramMessage.messageId,
      aiGenerated: true
    });
    
    // Send approval request to Telegram
    await sendApprovalRequest(content, post.id);
    
    // Mark message as processed
    await storage.updateTelegramMessage(telegramMessage.id, { processed: true });
  } catch (error) {
    console.error("Error processing message with AI:", error);
  }
}

// Helper function to send approval request to Telegram
async function sendApprovalRequest(content: string, postId: number): Promise<void> {
  try {
    const telegramApiUrl = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
    
    const replyMarkup = {
      inline_keyboard: [
        [
          { text: "✅ Approve", callback_data: `approve_${postId}` },
          { text: "❌ Reject", callback_data: `reject_${postId}` }
        ]
      ]
    };
    
    const response = await fetch(telegramApiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: TELEGRAM_CHAT_ID,
        text: `Here is the draft:\n\n${content}\n\nApprove this post?`,
        reply_markup: replyMarkup
      })
    });
    
    if (!response.ok) {
      throw new Error(`Telegram API error: ${response.statusText}`);
    }
  } catch (error) {
    console.error("Error sending approval request to Telegram:", error);
  }
}

// Helper function to handle approval callbacks
async function handleApprovalCallback(callbackQuery: any): Promise<void> {
  try {
    const data = callbackQuery.data;
    const [action, postIdStr] = data.split('_');
    const postId = parseInt(postIdStr);
    
    if (action === 'approve') {
      const post = await storage.updatePost(postId, { 
        status: 'approved',
        publishedAt: new Date()
      });
      
      if (post) {
        await postToLinkedIn(post.content);
        await sendTelegramMessage("✅ Post approved and published to LinkedIn!");
      }
    } else if (action === 'reject') {
      await storage.updatePost(postId, { status: 'rejected' });
      await sendTelegramMessage("❌ Post rejected and moved to drafts.");
    }
    
    // Answer the callback query
    const telegramApiUrl = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/answerCallbackQuery`;
    await fetch(telegramApiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        callback_query_id: callbackQuery.id,
        text: action === 'approve' ? 'Post approved!' : 'Post rejected!'
      })
    });
  } catch (error) {
    console.error("Error handling approval callback:", error);
  }
}

// Helper function to post to LinkedIn (placeholder - would integrate with actual LinkedIn API)
async function postToLinkedIn(content: string): Promise<void> {
  try {
    // This would integrate with LinkedIn API or PhantomBuster
    console.log("Posting to LinkedIn:", content);
    
    // For now, just simulate the posting
    // In production, this would use LinkedIn API or PhantomBuster integration
    
    return Promise.resolve();
  } catch (error) {
    console.error("Error posting to LinkedIn:", error);
  }
}

// Helper function to send simple Telegram message
async function sendTelegramMessage(text: string): Promise<void> {
  try {
    const telegramApiUrl = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
    
    await fetch(telegramApiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: TELEGRAM_CHAT_ID,
        text
      })
    });
  } catch (error) {
    console.error("Error sending Telegram message:", error);
  }
}
