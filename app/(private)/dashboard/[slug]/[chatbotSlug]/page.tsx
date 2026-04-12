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
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-3">
            <h1 className="text-xl md:text-2xl">{chatbot.name}</h1>
            <Badge
              className={
                chatbot.isActive
                  ? "bg-emerald-500"
                  : "bg-muted text-muted-foreground"
              }
            >
              {chatbot.isActive ? "Active" : "Inactive"}
            </Badge>
          </div>
          {chatbot.description && (
            <p className="text-sm text-muted-foreground">
              {chatbot.description}
            </p>
          )}
        </div>
      </div>

      <Separator />

      {/* Info Cards */}
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
