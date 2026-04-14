import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { dbConnect } from "@/lib/mongodb";
import { Organization } from "@/models/Organization";
import { Membership } from "@/models/Membership";
import { Chatbot } from "@/models/Chatbot";
import { notFound } from "next/navigation";
import { Separator } from "@/components/ui/separator";
import ChatbotPreviewPanel from "@/app/(private)/components/chatbot-preview-panel";

interface Props {
  params: Promise<{ slug: string; chatbotSlug: string }>;
}

export default async function ChatbotPreviewPage({ params }: Props) {
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
      <div className="flex flex-col">
        <h1 className="text-xl md:text-2xl">{chatbot.name} Preview</h1>
        <p className="text-md text-muted-foreground">
          Test how your chatbot responds before deploying it to users.
        </p>
      </div>
      <Separator />
      <ChatbotPreviewPanel
        organizationId={String(org._id)}
        chatbotId={String(chatbot._id)}
        chatbotName={chatbot.name}
        welcomeMessage={chatbot.welcomeMessage}
      />
    </div>
  );
}