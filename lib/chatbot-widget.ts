import { CHATBOT_COLORS, CHATBOT_POSITIONS, CHATBOT_SIZES } from "@/lib/validation/appearance";

type ChatbotColor = (typeof CHATBOT_COLORS)[number];
type ChatbotPosition = (typeof CHATBOT_POSITIONS)[number];
type ChatbotSize = (typeof CHATBOT_SIZES)[number];

export interface ChatbotAppearanceConfig {
  color: ChatbotColor;
  position: ChatbotPosition;
  size: ChatbotSize;
}

export interface PublicChatbotConfig {
  id: string;
  name: string;
  slug: string;
  description: string;
  welcomeMessage: string;
  systemPrompt: string;
  isActive: boolean;
  requirePreChat: boolean;
  appearance: ChatbotAppearanceConfig;
}

export const DEFAULT_APPEARANCE: ChatbotAppearanceConfig = {
  color: "slate",
  position: "bottom-right",
  size: "md",
};

export function getChatbotAppearance(appearance?: Partial<ChatbotAppearanceConfig> | null) {
  return {
    color: appearance?.color ?? DEFAULT_APPEARANCE.color,
    position: appearance?.position ?? DEFAULT_APPEARANCE.position,
    size: appearance?.size ?? DEFAULT_APPEARANCE.size,
  };
}

export function buildPublicChatbotConfig(chatbot: {
  _id: { toString(): string } | string;
  name: string;
  slug: string;
  description?: string | null;
  welcomeMessage?: string | null;
  systemPrompt?: string | null;
  isActive?: boolean | null;
  requirePreChat?: boolean | null;
  appearance?: Partial<ChatbotAppearanceConfig> | null;
}): PublicChatbotConfig {
  return {
    id: String(chatbot._id),
    name: chatbot.name,
    slug: chatbot.slug,
    description: chatbot.description?.trim() ?? "",
    welcomeMessage:
      chatbot.welcomeMessage?.trim() ||
      `Hi! I am ${chatbot.name}. Ask me anything.`,
    systemPrompt: chatbot.systemPrompt?.trim() ?? "",
    isActive: Boolean(chatbot.isActive),
    requirePreChat: Boolean(chatbot.requirePreChat),
    appearance: getChatbotAppearance(chatbot.appearance),
  };
}

export function getChatbotColorTokens(color: ChatbotColor) {
  const palette: Record<
    ChatbotColor,
    {
      primary: string;
      primaryHover: string;
      soft: string;
      ring: string;
      bubble: string;
    }
  > = {
    slate: {
      primary: "#334155",
      primaryHover: "#1e293b",
      soft: "#e2e8f0",
      ring: "rgba(51, 65, 85, 0.25)",
      bubble: "#f8fafc",
    },
    red: {
      primary: "#dc2626",
      primaryHover: "#b91c1c",
      soft: "#fee2e2",
      ring: "rgba(220, 38, 38, 0.25)",
      bubble: "#fff1f2",
    },
    orange: {
      primary: "#ea580c",
      primaryHover: "#c2410c",
      soft: "#ffedd5",
      ring: "rgba(234, 88, 12, 0.25)",
      bubble: "#fff7ed",
    },
    green: {
      primary: "#16a34a",
      primaryHover: "#15803d",
      soft: "#dcfce7",
      ring: "rgba(22, 163, 74, 0.25)",
      bubble: "#f0fdf4",
    },
    blue: {
      primary: "#2563eb",
      primaryHover: "#1d4ed8",
      soft: "#dbeafe",
      ring: "rgba(37, 99, 235, 0.25)",
      bubble: "#eff6ff",
    },
    violet: {
      primary: "#7c3aed",
      primaryHover: "#6d28d9",
      soft: "#ede9fe",
      ring: "rgba(124, 58, 237, 0.25)",
      bubble: "#f5f3ff",
    },
    pink: {
      primary: "#db2777",
      primaryHover: "#be185d",
      soft: "#fce7f3",
      ring: "rgba(219, 39, 119, 0.25)",
      bubble: "#fdf2f8",
    },
  };

  return palette[color];
}

export function getChatbotSizeTokens(size: ChatbotSize) {
  const sizes: Record<
    ChatbotSize,
    {
      launcher: number;
      panelWidth: number;
      panelHeight: number;
      spacing: number;
    }
  > = {
    sm: {
      launcher: 56,
      panelWidth: 320,
      panelHeight: 480,
      spacing: 16,
    },
    md: {
      launcher: 60,
      panelWidth: 360,
      panelHeight: 560,
      spacing: 20,
    },
    lg: {
      launcher: 64,
      panelWidth: 400,
      panelHeight: 640,
      spacing: 24,
    },
  };

  return sizes[size];
}

export function getAppBaseUrl() {
  const envUrl = process.env.NEXTAUTH_URL || process.env.APP_URL || process.env.SITE_URL;
  if (envUrl) return envUrl;

  const vercelUrl = process.env.VERCEL_URL;
  if (vercelUrl) {
    return vercelUrl.startsWith("http") ? vercelUrl : `https://${vercelUrl}`;
  }

  return "http://localhost:3000";
}
