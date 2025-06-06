import { 
  users, workflows, posts, telegramMessages, apiConfigs,
  type User, type InsertUser,
  type Workflow, type InsertWorkflow,
  type Post, type InsertPost,
  type TelegramMessage, type InsertTelegramMessage,
  type ApiConfig, type InsertApiConfig
} from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Workflows
  getWorkflows(): Promise<Workflow[]>;
  getWorkflow(id: number): Promise<Workflow | undefined>;
  createWorkflow(workflow: InsertWorkflow): Promise<Workflow>;
  updateWorkflow(id: number, updates: Partial<Workflow>): Promise<Workflow | undefined>;

  // Posts
  getPosts(): Promise<Post[]>;
  getPost(id: number): Promise<Post | undefined>;
  getPostsByStatus(status: string): Promise<Post[]>;
  createPost(post: InsertPost): Promise<Post>;
  updatePost(id: number, updates: Partial<Post>): Promise<Post | undefined>;
  getRecentPosts(limit?: number): Promise<Post[]>;

  // Telegram Messages
  getTelegramMessages(): Promise<TelegramMessage[]>;
  getTelegramMessage(id: number): Promise<TelegramMessage | undefined>;
  createTelegramMessage(message: InsertTelegramMessage): Promise<TelegramMessage>;
  updateTelegramMessage(id: number, updates: Partial<TelegramMessage>): Promise<TelegramMessage | undefined>;
  getUnprocessedMessages(): Promise<TelegramMessage[]>;

  // API Configs
  getApiConfigs(): Promise<ApiConfig[]>;
  getApiConfig(name: string): Promise<ApiConfig | undefined>;
  createApiConfig(config: InsertApiConfig): Promise<ApiConfig>;
  updateApiConfig(name: string, updates: Partial<ApiConfig>): Promise<ApiConfig | undefined>;

  // Dashboard Stats
  getDashboardStats(): Promise<{
    postsToday: number;
    pendingApprovals: number;
    aiCalls: number;
    engagement: number;
    successRate: number;
  }>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private workflows: Map<number, Workflow>;
  private posts: Map<number, Post>;
  private telegramMessages: Map<number, TelegramMessage>;
  private apiConfigs: Map<string, ApiConfig>;
  private currentId: number;

  constructor() {
    this.users = new Map();
    this.workflows = new Map();
    this.posts = new Map();
    this.telegramMessages = new Map();
    this.apiConfigs = new Map();
    this.currentId = 1;

    // Initialize with default workflow
    this.workflows.set(1, {
      id: 1,
      name: "Bhagya Sharma Social Media Agent",
      status: "active",
      lastRun: new Date(),
      totalRuns: 47,
      successRate: 94
    });
  }

  // Users
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Workflows
  async getWorkflows(): Promise<Workflow[]> {
    return Array.from(this.workflows.values());
  }

  async getWorkflow(id: number): Promise<Workflow | undefined> {
    return this.workflows.get(id);
  }

  async createWorkflow(insertWorkflow: InsertWorkflow): Promise<Workflow> {
    const id = this.currentId++;
    const workflow: Workflow = { 
      ...insertWorkflow, 
      id, 
      lastRun: null, 
      totalRuns: 0, 
      successRate: 0 
    };
    this.workflows.set(id, workflow);
    return workflow;
  }

  async updateWorkflow(id: number, updates: Partial<Workflow>): Promise<Workflow | undefined> {
    const workflow = this.workflows.get(id);
    if (!workflow) return undefined;
    
    const updated = { ...workflow, ...updates };
    this.workflows.set(id, updated);
    return updated;
  }

  // Posts
  async getPosts(): Promise<Post[]> {
    return Array.from(this.posts.values()).sort((a, b) => 
      new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime()
    );
  }

  async getPost(id: number): Promise<Post | undefined> {
    return this.posts.get(id);
  }

  async getPostsByStatus(status: string): Promise<Post[]> {
    return Array.from(this.posts.values()).filter(post => post.status === status);
  }

  async createPost(insertPost: InsertPost): Promise<Post> {
    const id = this.currentId++;
    const post: Post = { 
      ...insertPost, 
      id, 
      createdAt: new Date(), 
      publishedAt: null 
    };
    this.posts.set(id, post);
    return post;
  }

  async updatePost(id: number, updates: Partial<Post>): Promise<Post | undefined> {
    const post = this.posts.get(id);
    if (!post) return undefined;
    
    const updated = { ...post, ...updates };
    this.posts.set(id, updated);
    return updated;
  }

  async getRecentPosts(limit: number = 10): Promise<Post[]> {
    const posts = await this.getPosts();
    return posts.slice(0, limit);
  }

  // Telegram Messages
  async getTelegramMessages(): Promise<TelegramMessage[]> {
    return Array.from(this.telegramMessages.values()).sort((a, b) => 
      new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime()
    );
  }

  async getTelegramMessage(id: number): Promise<TelegramMessage | undefined> {
    return this.telegramMessages.get(id);
  }

  async createTelegramMessage(insertMessage: InsertTelegramMessage): Promise<TelegramMessage> {
    const id = this.currentId++;
    const message: TelegramMessage = { 
      ...insertMessage, 
      id, 
      createdAt: new Date() 
    };
    this.telegramMessages.set(id, message);
    return message;
  }

  async updateTelegramMessage(id: number, updates: Partial<TelegramMessage>): Promise<TelegramMessage | undefined> {
    const message = this.telegramMessages.get(id);
    if (!message) return undefined;
    
    const updated = { ...message, ...updates };
    this.telegramMessages.set(id, updated);
    return updated;
  }

  async getUnprocessedMessages(): Promise<TelegramMessage[]> {
    return Array.from(this.telegramMessages.values()).filter(msg => !msg.processed);
  }

  // API Configs
  async getApiConfigs(): Promise<ApiConfig[]> {
    return Array.from(this.apiConfigs.values());
  }

  async getApiConfig(name: string): Promise<ApiConfig | undefined> {
    return this.apiConfigs.get(name);
  }

  async createApiConfig(insertConfig: InsertApiConfig): Promise<ApiConfig> {
    const config: ApiConfig = { 
      ...insertConfig, 
      id: this.currentId++, 
      lastCheck: null 
    };
    this.apiConfigs.set(config.name, config);
    return config;
  }

  async updateApiConfig(name: string, updates: Partial<ApiConfig>): Promise<ApiConfig | undefined> {
    const config = this.apiConfigs.get(name);
    if (!config) return undefined;
    
    const updated = { ...config, ...updates };
    this.apiConfigs.set(name, updated);
    return updated;
  }

  // Dashboard Stats
  async getDashboardStats(): Promise<{
    postsToday: number;
    pendingApprovals: number;
    aiCalls: number;
    engagement: number;
    successRate: number;
  }> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const posts = Array.from(this.posts.values());
    const postsToday = posts.filter(post => 
      post.createdAt && new Date(post.createdAt) >= today
    ).length;
    
    const pendingApprovals = posts.filter(post => post.status === 'pending').length;
    
    // Mock AI calls and engagement for now
    const aiCalls = postsToday * 6; // Approximate calls per post
    const engagement = 94;
    const successRate = 94;
    
    return {
      postsToday,
      pendingApprovals,
      aiCalls,
      engagement,
      successRate
    };
  }
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async getWorkflows(): Promise<Workflow[]> {
    return await db.select().from(workflows);
  }

  async getWorkflow(id: number): Promise<Workflow | undefined> {
    const [workflow] = await db.select().from(workflows).where(eq(workflows.id, id));
    return workflow || undefined;
  }

  async createWorkflow(insertWorkflow: InsertWorkflow): Promise<Workflow> {
    const [workflow] = await db
      .insert(workflows)
      .values(insertWorkflow)
      .returning();
    return workflow;
  }

  async updateWorkflow(id: number, updates: Partial<Workflow>): Promise<Workflow | undefined> {
    const [workflow] = await db
      .update(workflows)
      .set(updates)
      .where(eq(workflows.id, id))
      .returning();
    return workflow || undefined;
  }

  async getPosts(): Promise<Post[]> {
    return await db.select().from(posts);
  }

  async getPost(id: number): Promise<Post | undefined> {
    const [post] = await db.select().from(posts).where(eq(posts.id, id));
    return post || undefined;
  }

  async getPostsByStatus(status: string): Promise<Post[]> {
    return await db.select().from(posts).where(eq(posts.status, status));
  }

  async createPost(insertPost: InsertPost): Promise<Post> {
    const [post] = await db
      .insert(posts)
      .values(insertPost)
      .returning();
    return post;
  }

  async updatePost(id: number, updates: Partial<Post>): Promise<Post | undefined> {
    const [post] = await db
      .update(posts)
      .set(updates)
      .where(eq(posts.id, id))
      .returning();
    return post || undefined;
  }

  async getRecentPosts(limit: number = 10): Promise<Post[]> {
    return await db.select().from(posts).limit(limit);
  }

  async getTelegramMessages(): Promise<TelegramMessage[]> {
    return await db.select().from(telegramMessages);
  }

  async getTelegramMessage(id: number): Promise<TelegramMessage | undefined> {
    const [message] = await db.select().from(telegramMessages).where(eq(telegramMessages.id, id));
    return message || undefined;
  }

  async createTelegramMessage(insertMessage: InsertTelegramMessage): Promise<TelegramMessage> {
    const [message] = await db
      .insert(telegramMessages)
      .values(insertMessage)
      .returning();
    return message;
  }

  async updateTelegramMessage(id: number, updates: Partial<TelegramMessage>): Promise<TelegramMessage | undefined> {
    const [message] = await db
      .update(telegramMessages)
      .set(updates)
      .where(eq(telegramMessages.id, id))
      .returning();
    return message || undefined;
  }

  async getUnprocessedMessages(): Promise<TelegramMessage[]> {
    return await db.select().from(telegramMessages).where(eq(telegramMessages.processed, false));
  }

  async getApiConfigs(): Promise<ApiConfig[]> {
    return await db.select().from(apiConfigs);
  }

  async getApiConfig(name: string): Promise<ApiConfig | undefined> {
    const [config] = await db.select().from(apiConfigs).where(eq(apiConfigs.name, name));
    return config || undefined;
  }

  async createApiConfig(insertConfig: InsertApiConfig): Promise<ApiConfig> {
    const [config] = await db
      .insert(apiConfigs)
      .values(insertConfig)
      .returning();
    return config;
  }

  async updateApiConfig(name: string, updates: Partial<ApiConfig>): Promise<ApiConfig | undefined> {
    const [config] = await db
      .update(apiConfigs)
      .set(updates)
      .where(eq(apiConfigs.name, name))
      .returning();
    return config || undefined;
  }

  async getDashboardStats(): Promise<{
    postsToday: number;
    pendingApprovals: number;
    aiCalls: number;
    engagement: number;
    successRate: number;
  }> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const allPosts = await db.select().from(posts);
    const postsToday = allPosts.filter(post => 
      post.createdAt && new Date(post.createdAt) >= today
    ).length;
    
    const pendingApprovals = allPosts.filter(post => post.status === 'pending').length;
    
    // Mock AI calls and engagement for now
    const aiCalls = postsToday * 6; // Approximate calls per post
    const engagement = 94;
    const successRate = 94;
    
    return {
      postsToday,
      pendingApprovals,
      aiCalls,
      engagement,
      successRate
    };
  }
}

export const storage = new DatabaseStorage();
