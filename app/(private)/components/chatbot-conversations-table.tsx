"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface ConversationMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: string;
}

interface ConversationRow {
  id: string;
  startedAt: string;
  updatedAt: string;
  visitorName: string;
  visitorEmail: string;
  totalMessages: number;
  messages: ConversationMessage[];
}

interface Props {
  conversations: ConversationRow[];
}

export default function ChatbotConversationsTable({ conversations }: Props) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Visitor</TableHead>
          <TableHead>Started</TableHead>
          <TableHead>Updated</TableHead>
          <TableHead>Total Messages</TableHead>
          <TableHead>Action</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {conversations.map((conversation) => (
          <TableRow key={conversation.id}>
            <TableCell className="whitespace-normal">
              <div className="flex flex-col gap-1">
                <p className="font-medium">
                  {conversation.visitorName || "Anonymous visitor"}
                </p>
                {conversation.visitorEmail ? (
                  <p className="text-sm text-muted-foreground">
                    {conversation.visitorEmail}
                  </p>
                ) : null}
              </div>
            </TableCell>
            <TableCell className="whitespace-normal text-sm text-muted-foreground">
              {new Date(conversation.startedAt).toLocaleString("id-ID", {
                day: "numeric",
                month: "long",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </TableCell>
            <TableCell className="whitespace-normal text-sm text-muted-foreground">
              {new Date(conversation.updatedAt).toLocaleString("id-ID", {
                day: "numeric",
                month: "long",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </TableCell>
            <TableCell>
              <Badge variant="outline">{conversation.totalMessages}</Badge>
            </TableCell>
            <TableCell>
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    View
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-h-[85vh] overflow-hidden sm:max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>
                      {conversation.visitorName || "Anonymous visitor"}
                    </DialogTitle>
                    <DialogDescription>
                      {conversation.visitorEmail || "No email provided"}
                    </DialogDescription>
                  </DialogHeader>
                  <div className="flex flex-col gap-3 overflow-y-auto pr-2">
                    <div className="flex flex-col gap-1 text-sm text-muted-foreground">
                      <p>
                        Started{" "}
                        {new Date(conversation.startedAt).toLocaleString(
                          "id-ID",
                          {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          },
                        )}
                      </p>
                      <p>
                        Updated{" "}
                        {new Date(conversation.updatedAt).toLocaleString(
                          "id-ID",
                          {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          },
                        )}
                      </p>
                      <p className="font-mono text-xs break-all">
                        {conversation.id}
                      </p>
                    </div>
                    <div className="flex flex-col gap-3">
                      {conversation.messages.map((message) => (
                        <div
                          key={message.id}
                          className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                        >
                          <div
                            className={`max-w-[85%] rounded-lg px-3 py-2 text-sm whitespace-pre-wrap ${
                              message.role === "user"
                                ? "bg-primary text-primary-foreground"
                                : "bg-muted text-foreground"
                            }`}
                          >
                            <p>{message.content}</p>
                            <p
                              className={`mt-2 text-[11px] ${
                                message.role === "user"
                                  ? "text-primary-foreground/80"
                                  : "text-muted-foreground"
                              }`}
                            >
                              {new Date(message.createdAt).toLocaleString(
                                "id-ID",
                                {
                                  day: "numeric",
                                  month: "short",
                                  year: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                },
                              )}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <DialogFooter showCloseButton />
                </DialogContent>
              </Dialog>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
