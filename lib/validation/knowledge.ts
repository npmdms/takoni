import { z } from "zod";

export const KNOWLEDGE_CATEGORIES = [
  "general",
  "product",
  "pricing",
  "support",
  "faq",
  "policy",
  "other",
];

export type KnowledgeCategory = (typeof KNOWLEDGE_CATEGORIES)[number];

export const createKnowledgeSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .max(100, "Cannot exceed 100 characters"),
  content: z
    .string()
    .min(1, "Content is required")
    .max(2000, "Cannot exceed 2000 characters"),
  category: z.enum(KNOWLEDGE_CATEGORIES, {
    error: "Category is required",
  }),
  tags: z.array(z.string().max(30)).max(10, "Cannot exceed 10 tags").optional(),
  isActive: z.boolean(),
});

export type CreateKnowledgeValues = z.infer<typeof createKnowledgeSchema>;
