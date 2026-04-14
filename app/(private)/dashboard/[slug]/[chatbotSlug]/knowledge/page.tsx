import { dbConnect } from "@/lib/mongodb";
import { Membership } from "@/models/Membership";
import { Organization } from "@/models/Organization";
import NotFound from "../../not-found";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { Chatbot } from "@/models/Chatbot";
import { authOptions } from "@/lib/auth";
import { Knowledge } from "@/models/Knowledge";
import { Separator } from "@/components/ui/separator";
import KnowledgeTable from "@/app/(private)/components/table/knowledge-table";

interface Props {
  params: Promise<{ slug: string; chatbotSlug: string }>;
}

export default async function KnowledgePage({ params }: Props) {
  const { slug, chatbotSlug } = await params;

  const session = await getServerSession(authOptions);
  if (!session) redirect("/sign-in");

  await dbConnect();

  const org = await Organization.findOne({ slug }).lean();
  if (!org) NotFound();

  const membership = await Membership.findOne({
    user: session.user.id,
    organization: org._id,
  }).lean();
  if (!membership) NotFound();

  const chatbot = await Chatbot.findOne({
    slug: chatbotSlug,
    organization: org._id,
  }).lean();
  if (!chatbot) NotFound();

  const knowledge = await Knowledge.find({ chatbot: chatbot._id })
    .lean()
    .sort({ createdAt: -1 });

  const data = knowledge.map((k) => ({
    id: String(k._id),
    title: k.title,
    content: k.content,
    category: k.category,
    tags: k.tags,
    isActive: k.isActive,
    createdAt: k.createdAt.toISOString(),
  }));

  return (
    <>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col">
          <h1 className="text-xl md:text-2xl">{chatbot.name} Knowledge</h1>
          <p className="text-md text-muted-foreground">
            Manage the information sources your AI uses to answer questions.
          </p>
        </div>
        <Separator />
        <div className="grid grid-cols-1 gap-6">
          <KnowledgeTable
            organizationId={String(org._id)}
            chatbotId={String(chatbot._id)}
            data={data}
          />
        </div>
      </div>
    </>
  );
}
