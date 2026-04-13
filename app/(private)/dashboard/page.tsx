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
import { ArrowRightIcon } from "@hugeicons/core-free-icons";
import { Separator } from "@/components/ui/separator";
import CreateOrganization from "../components/create-organization";
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
        </div>
        <p className="text-md text-muted-foreground">Description</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <CreateOrganization />
        {memberships.map((m) => (
          <Card key={m._id}>
            <CardHeader>
              <div className="grid grid-cols-3">
                <CardTitle className="col-span-2">
                  {m.organization.name}
                </CardTitle>
                <div className="flex justify-end">
                  <Badge
                    className={` ml-6 capitalize ${m.role === "owner" ? "bg-emerald-500" : "bg-muted text-muted-foreground"}`}
                  >
                    {m.role}
                  </Badge>
                </div>
              </div>
              <CardDescription>
                {m.organization.description || "No description"}
              </CardDescription>
              <CardDescription>{m.organization.supportEmail}</CardDescription>
              <CardDescription>
                {m.organization.address || "No address"}
              </CardDescription>
            </CardHeader>
            <Separator />
            <CardContent className="flex flex-wrap items-center gap-3">
              <EditOrganization
                disabled={m.role !== "owner"}
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
