import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { dbConnect } from "@/lib/mongodb";
import { Organization } from "@/models/Organization";
import { Membership } from "@/models/Membership";
import { Chatbot } from "@/models/Chatbot";
import { Message } from "@/models/Message";
import { notFound } from "next/navigation";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent } from "@/components/ui/card";
import ChatbotConversationsTable from "@/app/(private)/components/chatbot-conversations-table";

interface Props {
  params: Promise<{ slug: string; chatbotSlug: string }>;
}

interface LeanMessage {
  _id: { toString(): string } | string;
  conversationId: { toString(): string } | string;
  role: "user" | "assistant";
  content: string;
  createdAt: string | Date;
  visitor?: {
    name?: string;
    email?: string;
  };
}

export default async function ChatbotConversationsPage({ params }: Props) {
  const { slug, chatbotSlug } = await params;

  const session = await getServerSession(authOptions);
  if (!session) redirect("/sign-in");

  await dbConnect();

  const org = await Organization.findOne({ slug }).lean();
  if (!org) notFound();

  const membership = await Membership.findOne({
    user: session.user.id,
    organization: org._id,
  }).lean();
  if (!membership) notFound();

  const chatbot = await Chatbot.findOne({
    slug: chatbotSlug,
    organization: org._id,
  }).lean();
  if (!chatbot) notFound();

  const messages = (await Message.find({
    organization: org._id,
    chatbot: chatbot._id,
    source: "widget",
  })
    .sort({ createdAt: -1 })
    .lean()) as LeanMessage[];

  const conversationMap = new Map<
    string,
    {
      id: string;
      startedAt: Date;
      updatedAt: Date;
      visitorName: string;
      visitorEmail: string;
      messages: LeanMessage[];
    }
  >();

  for (const message of messages) {
    const conversationId = String(message.conversationId);
    const createdAt = new Date(message.createdAt);
    const existing = conversationMap.get(conversationId);

    if (!existing) {
      conversationMap.set(conversationId, {
        id: conversationId,
        startedAt: createdAt,
        updatedAt: createdAt,
        visitorName: message.visitor?.name ?? "",
        visitorEmail: message.visitor?.email ?? "",
        messages: [message],
      });
      continue;
    }

    existing.messages.push(message);
    if (createdAt < existing.startedAt) existing.startedAt = createdAt;
    if (createdAt > existing.updatedAt) existing.updatedAt = createdAt;
    if (!existing.visitorName && message.visitor?.name) {
      existing.visitorName = message.visitor.name;
    }
    if (!existing.visitorEmail && message.visitor?.email) {
      existing.visitorEmail = message.visitor.email;
    }
  }

  const conversations = Array.from(conversationMap.values()).sort(
    (a, b) => b.updatedAt.getTime() - a.updatedAt.getTime(),
  );

  const serializedConversations = conversations.map((conversation) => ({
    id: conversation.id,
    startedAt: conversation.startedAt.toISOString(),
    updatedAt: conversation.updatedAt.toISOString(),
    visitorName: conversation.visitorName,
    visitorEmail: conversation.visitorEmail,
    totalMessages: conversation.messages.length,
    messages: conversation.messages
      .slice()
      .reverse()
      .map((message) => ({
        id: String(message._id),
        role: message.role,
        content: message.content,
        createdAt: new Date(message.createdAt).toISOString(),
      })),
  }));

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col">
        <h1 className="text-xl md:text-2xl">{chatbot.name} Conversations</h1>
        <p className="text-md text-muted-foreground">
          Review conversation history captured from the public widget.
        </p>
      </div>
      <Separator />

      {conversations.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">
              No widget conversations yet.
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="pt-6">
            <ChatbotConversationsTable
              conversations={serializedConversations}
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
