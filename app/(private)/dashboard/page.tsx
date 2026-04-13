import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import "@/models/Organization";
import { Membership } from "@/models/Membership";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  ArrowRightIcon,
  BriefcaseIcon,
  ChatBotIcon,
  UserGroupIcon,
} from "@hugeicons/core-free-icons";
import { Separator } from "@/components/ui/separator";
import CreateOrganization from "../components/create-organization";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import EditOrganization from "../components/edit-organization";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/sign-in");

  const memberships = await Membership.find({ user: session.user.id })
    .populate("organization")
    .lean();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col">
        <div className="flex items-center justify-between">
          <h1 className="text-xl md:text-2xl">Organization&apos;s</h1>
          <CreateOrganization />
        </div>
        <p className="text-md text-muted-foreground">Description</p>
      </div>
      <div className="grid grid-cols-1 gap-6">
        {memberships.map((m) => (
          <Card key={m._id}>
            <CardHeader>
              <CardTitle>
                {m.organization.name}
              </CardTitle>
              <CardDescription>
                {m.organization.description}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p>Halo</p>
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {memberships.map((m) => (
          <Card
            key={m._id}
            className="hover:shadow-md transition duration-300 hover:bg-primary/3"
          >
            <CardHeader>
              <div className="flex items-start justify-between">
                <CardTitle className="flex items-center gap-1">
                  <HugeiconsIcon icon={BriefcaseIcon} />
                  {m.organization.name}
                </CardTitle>
                <Badge
                  className={`ml-6 capitalize ${m.role === "owner" ? "bg-emerald-500" : "bg-muted text-muted-foreground"}`}
                >
                  {m.role}
                </Badge>
              </div>
              <CardDescription>{m.organization.description}</CardDescription>
            </CardHeader>
            <CardContent className="flex items-center gap-3">
              <Tooltip>
                <TooltipTrigger className="flex items-center gap-3">
                  <HugeiconsIcon icon={UserGroupIcon} />x
                </TooltipTrigger>
                <TooltipContent>Total of Member&apos;s</TooltipContent>
              </Tooltip>
              <Separator orientation="vertical" />
              <Tooltip>
                <TooltipTrigger className="flex items-center gap-3">
                  <HugeiconsIcon icon={ChatBotIcon} />x
                </TooltipTrigger>
                <TooltipContent>Total of Chatbot&apos;s</TooltipContent>
              </Tooltip>
              <EditOrganization
                organization={{
                  id: String(m.organization._id),
                  name: m.organization.name,
                  description: m.organization.description,
                  supportEmail: m.organization.supportEmail,
                  address: m.organization.address,
                }}
              />
              <Button asChild>
                <Link href={`/dashboard/${m.organization.slug}`}>
                  <HugeiconsIcon icon={ArrowRightIcon} />
                  Enter
                </Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
