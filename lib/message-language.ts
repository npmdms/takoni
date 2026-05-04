const LATIN_WORD_RE = /[A-Za-z]+(?:'[A-Za-z]+)*/g;

const ENGLISH_MARKERS = new Set([
  "a",
  "an",
  "and",
  "are",
  "can",
  "do",
  "hello",
  "help",
  "hi",
  "how",
  "i",
  "i'm",
  "is",
  "it",
  "please",
  "the",
  "what",
  "why",
  "you",
  "your",
]);

const INDONESIAN_MARKERS = new Set([
  "ada",
  "aku",
  "anda",
  "apa",
  "apakah",
  "bisa",
  "boleh",
  "dalam",
  "dan",
  "dengan",
  "halo",
  "hai",
  "ini",
  "itu",
  "jika",
  "kami",
  "kamu",
  "kenapa",
  "mohon",
  "saya",
  "silakan",
  "singkat",
  "tidak",
  "tolong",
  "untuk",
  "yang",
]);

export type SupportedReplyLanguage =
  | "english"
  | "indonesian"
  | "arabic"
  | "japanese"
  | "korean"
  | "russian"
  | "thai"
  | "hindi"
  | "chinese";

function detectScriptLanguage(text: string): SupportedReplyLanguage | null {
  for (const char of text) {
    if (!char.trim()) continue;

    if (/[\u0600-\u06FF]/u.test(char)) return "arabic";
    if (/[\u3040-\u30FF]/u.test(char)) return "japanese";
    if (/[\uAC00-\uD7AF]/u.test(char)) return "korean";
    if (/[\u0400-\u04FF]/u.test(char)) return "russian";
    if (/[\u0E00-\u0E7F]/u.test(char)) return "thai";
    if (/[\u0900-\u097F]/u.test(char)) return "hindi";
    if (/[\u4E00-\u9FFF]/u.test(char)) return "chinese";
  }

  return null;
}

export function detectReplyLanguage(
  text: string,
): SupportedReplyLanguage {
  const scriptLanguage = detectScriptLanguage(text);
  if (scriptLanguage) return scriptLanguage;

  const words = text.toLowerCase().match(LATIN_WORD_RE) ?? [];
  for (const word of words) {
    if (INDONESIAN_MARKERS.has(word)) return "indonesian";
    if (ENGLISH_MARKERS.has(word)) return "english";
  }

  return "english";
}

export function getReplyLanguageInstruction(language: SupportedReplyLanguage) {
  switch (language) {
    case "indonesian":
      return "Reply in Indonesian. Follow the first language that appears in the user's latest message.";
    case "arabic":
      return "Reply in Arabic. Follow the first language that appears in the user's latest message.";
    case "japanese":
      return "Reply in Japanese. Follow the first language that appears in the user's latest message.";
    case "korean":
      return "Reply in Korean. Follow the first language that appears in the user's latest message.";
    case "russian":
      return "Reply in Russian. Follow the first language that appears in the user's latest message.";
    case "thai":
      return "Reply in Thai. Follow the first language that appears in the user's latest message.";
    case "hindi":
      return "Reply in Hindi. Follow the first language that appears in the user's latest message.";
    case "chinese":
      return "Reply in Chinese. Follow the first language that appears in the user's latest message.";
    case "english":
    default:
      return "Reply in English. Follow the first language that appears in the user's latest message.";
  }
}

export function getNoContextReply(
  language: SupportedReplyLanguage,
  supportEmail: string,
) {
  switch (language) {
    case "indonesian":
      return `Maaf, info tidak tersedia. Hubungi ${supportEmail}.`;
    case "arabic":
      return `عذرا، المعلومات غير متوفرة. تواصل مع ${supportEmail}.`;
    case "japanese":
      return `申し訳ありませんが、情報はありません。${supportEmail} にご連絡ください。`;
    case "korean":
      return `죄송하지만 해당 정보가 없습니다. ${supportEmail}로 문의해 주세요.`;
    case "russian":
      return `Извините, информация недоступна. Свяжитесь с ${supportEmail}.`;
    case "thai":
      return `ขออภัย ไม่มีข้อมูลนี้ กรุณาติดต่อ ${supportEmail}`;
    case "hindi":
      return `क्षमा करें, यह जानकारी उपलब्ध नहीं है। ${supportEmail} पर संपर्क करें।`;
    case "chinese":
      return `抱歉，暂无相关信息。请联系 ${supportEmail}。`;
    case "english":
    default:
      return `Sorry, that information is not available. Contact ${supportEmail}.`;
  }
}
