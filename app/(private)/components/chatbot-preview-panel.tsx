"use client";

import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

type ChatRole = "user" | "assistant";

interface ChatMessage {
  role: ChatRole;
  content: string;
}

interface Props {
  organizationId: string;
  chatbotId: string;
  chatbotName: string;
  welcomeMessage?: string;
}

export default function ChatbotPreviewPanel({
  organizationId,
  chatbotId,
  chatbotName,
  welcomeMessage,
}: Props) {
  const initialMessages = useMemo<ChatMessage[]>(
    () => [
      {
        role: "assistant",
        content:
          welcomeMessage?.trim() ||
          `Hi! I am ${chatbotName}. Ask me anything to test this chatbot.`,
      },
    ],
    [chatbotName, welcomeMessage],
  );

  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function sendMessage() {
    const message = input.trim();
    if (!message || isSending) return;

    setIsSending(true);
    setError(null);
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: message }]);

    try {
      const res = await fetch(
        `/api/organizations/${organizationId}/chatbots/${chatbotId}/preview`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message }),
        },
      );

      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Failed to get AI response.");
        return;
      }

      setMessages((prev) => [...prev, { role: "assistant", content: data.reply }]);
    } catch {
      setError("Unable to connect to preview API.");
    } finally {
      setIsSending(false);
    }
  }

  function resetConversation() {
    setMessages(initialMessages);
    setInput("");
    setError(null);
  }

  return (
    <div className="grid grid-cols-1 gap-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Live Preview</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="max-h-[420px] overflow-y-auto rounded-md border p-3 space-y-3">
            {messages.map((msg, idx) => (
              <div
                key={`${msg.role}-${idx}`}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] rounded-lg px-3 py-2 text-sm whitespace-pre-wrap ${
                    msg.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-foreground"
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <div className="space-y-2">
            <Textarea
              placeholder="Type a message to test your chatbot..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={isSending}
              className="min-h-[100px]"
            />
            <div className="flex gap-2">
              <Button type="button" onClick={sendMessage} disabled={isSending || !input.trim()}>
                {isSending ? "Sending..." : "Send Message"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={resetConversation}
                disabled={isSending}
              >
                Reset
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Preview Notes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>
            This preview uses your chatbot configuration and active knowledge entries as
            context when calling Qwen.
          </p>
          <div className="flex items-center gap-2">
            <span>Provider:</span>
            <Badge variant="outline">Alibaba Qwen</Badge>
          </div>
          <p>Set `QWEN_API_KEY` in your `.env` file to enable responses.</p>
        </CardContent>
      </Card>
    </div>
  );
}
