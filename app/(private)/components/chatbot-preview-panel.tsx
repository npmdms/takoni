"use client";

import { useMemo, useRef, useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

type ChatRole = "user" | "assistant";

interface ChatMessage {
  role: ChatRole;
  content: string;
}

function isAbortError(error: unknown) {
  return error instanceof Error && error.name === "AbortError";
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
          welcomeMessage?.trim() || `Hi! I am ${chatbotName}. Ask me anything.`,
      },
    ],
    [chatbotName, welcomeMessage],
  );

  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isSending]);

  async function sendMessage() {
    const message = input.trim();
    if (!message || isSending) return;

    setIsSending(true);
    setError(null);
    setInput("");

    const updated = [
      ...messages,
      { role: "user" as ChatRole, content: message },
    ];
    setMessages(updated);

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);

    try {
      const res = await fetch(
        `/api/organizations/${organizationId}/chatbots/${chatbotId}/preview`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message, messages: updated }),
          signal: controller.signal,
        },
      );

      clearTimeout(timeout);
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Failed to get response.");
        return;
      }

      const reply = typeof data.reply === "string" ? data.reply.trim() : "";
      if (!reply) {
        setError("Empty response.");
        return;
      }

      setMessages((prev) => [...prev, { role: "assistant", content: reply }]);
    } catch (err: unknown) {
      clearTimeout(timeout);
      if (isAbortError(err)) {
        setError("Request timed out. Try again.");
      } else {
        setError("Unable to connect.");
      }
    } finally {
      setIsSending(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">{chatbotName}</CardTitle>
            <div className="flex items-center gap-2">
              <Badge variant="outline">Qwen3.6-Flash</Badge>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setMessages(initialMessages);
                  setError(null);
                }}
                disabled={isSending}
              >
                Reset
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <div className="h-80 overflow-y-auto flex flex-col gap-2 border rounded-md p-3">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] rounded-lg px-3 py-2 text-sm whitespace-pre-wrap ${
                    msg.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-foreground"
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}

            {isSending && (
              <div className="flex justify-start">
                <div className="bg-muted rounded-lg px-3 py-2 text-sm text-muted-foreground">
                  Thinking...
                </div>
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <div className="flex gap-2">
            <Input
              placeholder="Type a message..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") sendMessage();
              }}
              disabled={isSending}
            />
            <Button onClick={sendMessage} disabled={isSending || !input.trim()}>
              Send
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">Press Enter to send.</p>
        </CardContent>
      </Card>
    </div>
  );
}
