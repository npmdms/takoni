import { z } from "zod";

export const CHATBOT_COLORS = [
  "slate",
  "red",
  "orange",
  "green",
  "blue",
  "violet",
  "pink",
] as const;
export const CHATBOT_POSITIONS = ["bottom-right", "bottom-left"] as const;
export const CHATBOT_SIZES = ["sm", "md", "lg"] as const;

export const appearanceSchema = z.object({
  color: z.enum(CHATBOT_COLORS),
  position: z.enum(CHATBOT_POSITIONS),
  size: z.enum(CHATBOT_SIZES),
});

export type AppearanceValues = z.infer<typeof appearanceSchema>;
