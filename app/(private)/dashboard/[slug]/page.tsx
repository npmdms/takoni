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
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { HugeiconsIcon } from "@hugeicons/react";
import { Separator } from "@/components/ui/separator";
import { ChatBotIcon, EyeIcon } from "@hugeicons/core-free-icons";

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
        <div className="flex items-center justify-between">
          <h1 className="text-xl md:text-2xl">{org.name}</h1>
          <CreateChatbot organizationId={String(org._id)} slug={slug} />
        </div>
        <p className="text-md text-muted-foreground">Description</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {chatbots.length === 0 ? (
          <p className="text-sm text-muted-foreground">No chatbots yet.</p>
        ) : (
          chatbots.map((c) => (
            <Link key={c._id} href={`/dashboard/${slug}/${c.slug}`}>
              <Card className="hover:shadow-md transition duration-300 hover:cursor-pointer hover:bg-primary/3">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <CardTitle className="flex items-center gap-1">
                      <HugeiconsIcon icon={ChatBotIcon} />
                      {c.name}
                    </CardTitle>
                    <Badge
                      className={`ml-6 capitalize ${c.isActive ? "bg-emerald-500" : "bg-muted text-muted-foreground"}`}
                    >
                      {c.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                  <CardDescription>{c.description}</CardDescription>
                </CardHeader>
                <CardContent className="flex items-center gap-3">
                  <Tooltip>
                    <TooltipTrigger className="flex items-center gap-3">
                      <HugeiconsIcon icon={EyeIcon} />x
                    </TooltipTrigger>
                    <TooltipContent>Total of X&apos;s</TooltipContent>
                  </Tooltip>
                  <Separator orientation="vertical" />
                  <Tooltip>
                    <TooltipTrigger className="flex items-center gap-3">
                      <HugeiconsIcon icon={EyeIcon} />x
                    </TooltipTrigger>
                    <TooltipContent>Total of Y&apos;s</TooltipContent>
                  </Tooltip>
                </CardContent>
              </Card>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
