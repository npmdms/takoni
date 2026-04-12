"use client";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ChatBotIcon, UserGroupIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import Link from "next/link";
import { useEffect, useState } from "react";

type Organization = {
  _id: string;
  name: string;
  slug: string;
  description?: string;
};

type MembershipWithOrg = {
  organization: Organization;
  role: "owner" | "member";
};

const roleBadgeColor: Record<string, string> = {
  owner: "bg-emerald-500",
  member: "bg-zinc-500",
};

export default function OrganizationList() {
  const [memberships, setMemberships] = useState<MembershipWithOrg[]>([]);
  const [loading, setLoading] = useState(true);
  const [serverError, setServerError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchOrganizations() {
      try {
        const res = await fetch("/api/organizations", {
          cache: "no-store",
        });
        const data = await res.json();

        if (!res.ok) {
          setServerError(data.error ?? "Failed to load organizations");
        }

        setMemberships(data);
      } catch (error) {
        setServerError("Unable to connect. Please try again.");
      } finally {
        setLoading(false);
      }
    }

    fetchOrganizations();
  }, []);

  return (
    <>
      {memberships.map(({ organization, role }) => (
        <Link href={`/dashboard/${organization.slug}`} key={organization._id}>
          <Card className="hover:shadow-md transition duration-300 hover:cursor-pointer">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>{organization.name}</CardTitle>
                <Badge className={`${roleBadgeColor[role]} ml-6 capitalize`}>
                  {role}
                </Badge>
              </div>
              <CardDescription>{organization.description}</CardDescription>
            </CardHeader>
            <CardContent className="flex justify-between gap-3">
              <div className="flex items-center gap-3">
                <HugeiconsIcon icon={ChatBotIcon} />0
              </div>
              <Separator orientation="vertical" className="h-4" />
              <div className="flex items-center gap-3">
                <HugeiconsIcon icon={UserGroupIcon} />0
              </div>
            </CardContent>
          </Card>
        </Link>
      ))}
    </>
  );
}
