import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { dbConnect } from "@/lib/mongodb";
import { Organization } from "@/models/Organization";
import { Membership } from "@/models/Membership";
import { Chatbot } from "@/models/Chatbot";
import { notFound } from "next/navigation";
import AppearanceForm from "@/app/(private)/components/appearance-form";
import { Separator } from "@/components/ui/separator";

interface Props {
  params: Promise<{ slug: string; chatbotSlug: string }>;
}

export default async function AppearancePage({ params }: Props) {
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
        <h1 className="text-xl md:text-2xl">{chatbot.name} Appearance</h1>
        <p className="text-md text-muted-foreground">
          Customize your chatbot appearance
        </p>
      </div>
      <Separator />
      <AppearanceForm
        organizationId={String(org._id)}
        chatbotId={String(chatbot._id)}
        chatbotName={chatbot.name}
        appearance={{
          color: chatbot.appearance?.color ?? "slate",
          position: chatbot.appearance?.position ?? "bottom-right",
          size: chatbot.appearance?.size ?? "md",
        }}
      />
    </div>
  );
}
