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
import { ChatBotIcon, UserGroupIcon } from "@hugeicons/core-free-icons";
import { Separator } from "@/components/ui/separator";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/sign-in");

  const memberships = await Membership.find({ user: session.user.id })
    .populate("organization")
    .lean();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col">
        <h1 className="text-xl md:text-2xl">Organization&apos;s</h1>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {memberships.map((m) => (
          <Link key={m._id} href={`/dashboard/${m.organization.slug}`}>
            <Card className="hover:shadow-md transition duration-300 hover:cursor-pointer hover:bg-primary/3">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <CardTitle>{m.organization.name}</CardTitle>
                  <Badge
                    className={`ml-6 capitalize ${m.role === "owner" ? "bg-emerald-500" : "bg-primary"}`}
                  >
                    {m.role}
                  </Badge>
                </div>
                <CardDescription>{m.organization.description}</CardDescription>
              </CardHeader>
              <CardContent className="flex justify-center gap-3">
                <p className="flex items-center gap-3">
                  <HugeiconsIcon icon={ChatBotIcon} />x
                </p>
                <Separator orientation="vertical" />
                <p className="flex items-center gap-3">
                  <HugeiconsIcon icon={UserGroupIcon} />x
                </p>
              </CardContent>
            </Card>
          </Link>
        ))}
        {session.user.id}
      </div>
    </div>
  );
}
