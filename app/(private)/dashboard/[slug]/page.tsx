import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { dbConnect } from "@/lib/mongodb";
import { Organization } from "@/models/Organization";
import { Membership } from "@/models/Membership";
import NotFound from "./not-found";
import CreateChatbot from "../../components/create-chatbot";
import { Chatbot } from "@/models/Chatbot";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { HugeiconsIcon } from "@hugeicons/react";
import { Separator } from "@/components/ui/separator";
import { ArrowRightIcon } from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import EditChatbot from "../../components/edit-chatbot";
import CreateKnowledge from "../../components/create-knowledge";

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function OrganizationPage({ params }: Props) {
  const { slug } = await params;

  const session = await getServerSession(authOptions);
  if (!session) redirect("/sign-in");

  await dbConnect();

  const org = await Organization.findOne({ slug }).lean();
  if (!org) return NotFound();

  const membership = await Membership.findOne({
    user: session.user.id,
    organization: org._id,
  }).lean();
  if (!membership) NotFound();

  const chatbots = await Chatbot.find({ organization: org._id }).lean();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col">
        <h1 className="text-xl md:text-2xl">{org.name}</h1>
        <p className="text-md text-muted-foreground">Description</p>
      </div>
      <Separator />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <CreateChatbot organizationId={String(org._id)} slug={slug} />
        {chatbots.map((c) => (
          <Card key={c._id}>
            <CardHeader>
              <div className="grid grid-cols-3">
                <CardTitle className="col-span-2">{c.name}</CardTitle>
                <div className="flex justify-end">
                  <Badge
                    className={`ml-6 capitalize ${c.isActive ? "bg-emerald-500" : "bg-muted text-muted-foreground"}`}
                  >
                    {c.isActive ? "Active" : "Inactive"}
                  </Badge>
                </div>
              </div>
              <CardDescription>
                {c.description || "No description"}
              </CardDescription>
            </CardHeader>
            <Separator />
            <CardContent className="flex flex-col gap-3">
              <div className="flex flex-col gap-1">
                <small className="text-muted-foreground">Welcome Message</small>
                <p>{c.welcomeMessage}</p>
              </div>
              <Separator className="md:hidden" orientation="vertical" />
              <div className="flex flex-col gap-1">
                <small className="text-muted-foreground">System Prompt</small>
                <p>{c.systemPrompt}</p>
              </div>
              <div className="flex flex-col gap-1">
                <small className="text-muted-foreground">Prechat Form</small>
                <p className={c.requirePreChat ? "text-emerald-500" : ""}>
                  {c.requirePreChat ? "Active" : "Inactive"}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <EditChatbot
                  chatbot={{
                    id: String(c._id),
                    organizationId: String(org._id),
                    name: c.name,
                    description: c.description,
                    systemPrompt: c.systemPrompt,
                    welcomeMessage: c.welcomeMessage,
                    isActive: c.isActive,
                    requirePreChat: c.requirePreChat,
                  }}
                />
                <CreateKnowledge
                  organizationId={String(org._id)}
                  chatbotId={String(c._id)}
                />
                <Button asChild>
                  <Link href={`/dashboard/${slug}/${c.slug}`}>
                    <HugeiconsIcon icon={ArrowRightIcon} />
                    Enter
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
