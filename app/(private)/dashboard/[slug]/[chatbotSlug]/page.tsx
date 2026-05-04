import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { dbConnect } from "@/lib/mongodb";
import { Organization } from "@/models/Organization";
import { Membership } from "@/models/Membership";
import { Chatbot } from "@/models/Chatbot";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  BookIcon,
  EyeIcon,
  PaintBrush02Icon,
  Comment01Icon,
} from "@hugeicons/core-free-icons";
import { Knowledge } from "@/models/Knowledge";
import { getAppBaseUrl } from "@/lib/chatbot-widget";
import { Message } from "@/models/Message";

interface Props {
  params: Promise<{ slug: string; chatbotSlug: string }>;
}

export default async function ChatbotPage({ params }: Props) {
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

  const knowledgeCount = await Knowledge.countDocuments({
    organizationId: org._id,
    chatbotId: chatbot._id,
  });
  const conversationCount = await Message.distinct("conversationId", {
    chatbot: chatbot._id,
    source: "widget",
  }).then((ids) => ids.length);
  const widgetUrl = `${getAppBaseUrl()}${slug}/${chatbot.slug}/widget.js`;
  const embedCode =
    chatbot.isActive && knowledgeCount > 0
      ? `<script src="${widgetUrl}" defer></script>`
      : null;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-xl md:text-2xl">{chatbot.name}</h1>
            <Badge variant={chatbot.isActive ? "default" : "secondary"}>
              {chatbot.isActive ? "Active" : "Inactive"}
            </Badge>
          </div>
          <p className="text-md text-muted-foreground">
            Overview of your chatbot configuration, content readiness, and quick
            actions.
          </p>
        </div>
      </div>

      <Separator />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">
              Navigation
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            <Button variant={"outline"} className="justify-start" asChild>
              <Link href={`/dashboard/${slug}/${chatbotSlug}/knowledge`}>
                <HugeiconsIcon icon={BookIcon} />
                Knowledge Base
              </Link>
            </Button>
            <Button variant={"outline"} className="justify-start" asChild>
              <Link href={`/dashboard/${slug}/${chatbotSlug}/preview`}>
                <HugeiconsIcon icon={EyeIcon} />
                Preview
              </Link>
            </Button>
            <Button variant={"outline"} className="justify-start" asChild>
              <Link href={`/dashboard/${slug}/${chatbotSlug}/appearance`}>
                <HugeiconsIcon icon={PaintBrush02Icon} />
                Appearance
              </Link>
            </Button>
            <Button variant={"outline"} className="justify-start" asChild>
              <Link href={`/dashboard/${slug}/${chatbotSlug}/conversations`}>
                <HugeiconsIcon icon={Comment01Icon} />
                Conversations
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">
              Knowledge Base
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold">{knowledgeCount}</p>
            <p className="text-sm text-muted-foreground">
              {knowledgeCount === 1 ? "Document" : "Documents"} available
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">
              Conversations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold">{conversationCount}</p>
            <p className="text-sm text-muted-foreground">
              Widget sessions captured
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">
              Pre-chat Form
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm font-medium">
              {chatbot.requirePreChat ? "Enabled" : "Disabled"}
            </p>
            <p className="text-sm text-muted-foreground">
              {chatbot.requirePreChat
                ? "Visitors will fill details before chatting."
                : "Visitors can start chatting immediately."}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">
              Description
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm">
              {chatbot.description?.trim() ? (
                chatbot.description
              ) : (
                <span className="text-muted-foreground italic">Not set</span>
              )}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">
              System Prompt
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm">
              {chatbot.systemPrompt ?? (
                <span className="text-muted-foreground italic">Not set</span>
              )}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">
              Welcome Message
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm">
              {chatbot.welcomeMessage ?? (
                <span className="text-muted-foreground italic">Not set</span>
              )}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">
              Slug
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm font-mono">{chatbot.slug}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">
              Created
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm">
              {new Date(chatbot.createdAt).toLocaleDateString("id-ID", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">
              Last Updated
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm">
              {new Date(chatbot.updatedAt).toLocaleDateString("id-ID", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </p>
          </CardContent>
        </Card>

        <Card className="md:col-span-3">
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">
              Embed Widget
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            {embedCode ? (
              <>
                <div className="flex flex-col gap-2 text-sm text-muted-foreground">
                  <p>1. Copy the script below.</p>
                  <p>2. Paste it into your website layout or global template, right before the closing <code>{`</body>`}</code> tag.</p>
                  <p>3. Publish your site. The chatbot will stay available while users navigate between pages.</p>
                </div>
                <code className="block text-xs bg-muted rounded-md px-3 py-2 break-all">
                  {embedCode}
                </code>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">
                Widget embed is available only when the chatbot is active and at
                least one knowledge document is ready.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
