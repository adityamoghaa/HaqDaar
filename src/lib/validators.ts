// Request validation schemas with Zod
import { z } from "zod";

export const messageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string().min(1).max(10000),
});

export const chatRequestSchema = z.object({
  system: z.string().min(1).max(5000),
  messages: z.array(messageSchema).min(1).max(50),
});

export const matchRequestSchema = z.object({
  profile: z.record(z.unknown()),
  candidates: z.array(z.record(z.unknown())).min(1).max(100),
});

export const explainRequestSchema = z.object({
  profile: z.record(z.unknown()),
  scheme: z.record(z.unknown()),
  language: z.string().optional().default("en"),
});

export type ChatRequest = z.infer<typeof chatRequestSchema>;
export type MatchRequest = z.infer<typeof matchRequestSchema>;
export type ExplainRequest = z.infer<typeof explainRequestSchema>;
