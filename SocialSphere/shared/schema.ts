import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const workflows = pgTable("workflows", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  status: text("status").notNull().default("active"), // active, paused, error
  lastRun: timestamp("last_run"),
  totalRuns: integer("total_runs").default(0),
  successRate: integer("success_rate").default(0),
});

export const posts = pgTable("posts", {
  id: serial("id").primaryKey(),
  content: text("content").notNull(),
  status: text("status").notNull(), // draft, pending, approved, rejected, posted, failed
  platform: text("platform").notNull().default("linkedin"),
  telegramMessageId: text("telegram_message_id"),
  aiGenerated: boolean("ai_generated").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  publishedAt: timestamp("published_at"),
  metrics: text("metrics"), // JSON string for likes, comments, shares
});

export const telegramMessages = pgTable("telegram_messages", {
  id: serial("id").primaryKey(),
  messageId: text("message_id").notNull(),
  chatId: text("chat_id").notNull(),
  content: text("content").notNull(),
  messageType: text("message_type").notNull(), // text, voice, callback_query
  processed: boolean("processed").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const apiConfigs = pgTable("api_configs", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  apiKey: text("api_key").notNull(),
  status: text("status").notNull().default("active"), // active, inactive, error
  lastCheck: timestamp("last_check"),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertWorkflowSchema = createInsertSchema(workflows).omit({
  id: true,
  lastRun: true,
  totalRuns: true,
  successRate: true,
});

export const insertPostSchema = createInsertSchema(posts).omit({
  id: true,
  createdAt: true,
  publishedAt: true,
});

export const insertTelegramMessageSchema = createInsertSchema(telegramMessages).omit({
  id: true,
  createdAt: true,
});

export const insertApiConfigSchema = createInsertSchema(apiConfigs).omit({
  id: true,
  lastCheck: true,
});

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Workflow = typeof workflows.$inferSelect;
export type InsertWorkflow = z.infer<typeof insertWorkflowSchema>;

export type Post = typeof posts.$inferSelect;
export type InsertPost = z.infer<typeof insertPostSchema>;

export type TelegramMessage = typeof telegramMessages.$inferSelect;
export type InsertTelegramMessage = z.infer<typeof insertTelegramMessageSchema>;

export type ApiConfig = typeof apiConfigs.$inferSelect;
export type InsertApiConfig = z.infer<typeof insertApiConfigSchema>;
