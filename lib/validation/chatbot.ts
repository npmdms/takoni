import { z } from "zod";

export const createChatbotSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(20, "Cannot exceed 20 characters"),
  description: z.string().max(256, "Cannot exceed 256 characters").optional(),
  systemPrompt: z.string().max(256, "Cannot exceed 256 characters").optional(),
  welcomeMessage: z.string().max(64, "Cannot exceed 64 characters").optional(),
  isActive: z.boolean(),
  requirePreChat: z.boolean(),
});

export type CreateChatbotValues = z.infer<typeof createChatbotSchema>;
