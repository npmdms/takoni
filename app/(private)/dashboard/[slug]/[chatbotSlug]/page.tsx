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
import { BookIcon, EyeIcon } from "@hugeicons/core-free-icons";

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

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3">
        <div className="flex flex-col">
          <h1 className="text-xl md:text-2xl">{chatbot.name}</h1>
          <p className="text-md text-muted-foreground">
            Configure knowledge base, and appearance of your chatbots.
          </p>
        </div>
        <div className="flex flex-row flex-wrap gap-3">
          <Button variant={"outline"} className="w-fit" asChild>
            <Link href={`/dashboard/${slug}/${chatbotSlug}/knowledge`}>
              <HugeiconsIcon icon={BookIcon} />
              Knowledge Base
            </Link>
          </Button>
          <Button variant={"outline"} className="w-fit" asChild>
            <Link href={`/dashboard/${slug}/${chatbotSlug}/preview`}>
              <HugeiconsIcon icon={EyeIcon} />
              Preview
            </Link>
          </Button>
        </div>
      </div>

      <Separator />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              Pre-chat Form
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm">
              {chatbot.requirePreChat ? "Enabled" : "Disabled"}
            </p>
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
      </div>
    </div>
  );
}
