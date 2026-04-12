"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ChatBotIcon,
  UserGroupIcon,
  ArrowRight02Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import Link from "next/link";

type Organization = {
  _id: string;
  name: string;
  slug: string;
  description?: string;
};

type MembershipWithOrg = {
  organization: Organization;
  role: "owner" | "admin" | "member";
};

const roleBadgeColor: Record<string, string> = {
  owner: "bg-emerald-500",
  admin: "bg-blue-500",
  member: "bg-zinc-500",
};

export default function ListOrganization() {
  const [memberships, setMemberships] = useState<MembershipWithOrg[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchOrganizations() {
      try {
        const res = await fetch("/api/organizations");
        const data = await res.json();

        if (!res.ok) {
          setError(data.error ?? "Failed to load organizations.");
          return;
        }

        setMemberships(data);
      } catch {
        setError("Unable to connect. Please try again.");
      } finally {
        setLoading(false);
      }
    }

    fetchOrganizations();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col gap-3">
        {[...Array(3)].map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-5 w-48" />
              <Skeleton className="h-4 w-full mt-1" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-24" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return <p className="text-sm text-destructive">{error}</p>;
  }

  if (memberships.length === 0) {
    return (
      <Card className="border-dashed">
        <CardHeader>
          <CardTitle>No organizations yet</CardTitle>
          <CardDescription>
            You're not part of any organization. Create one to get started.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {memberships.map(({ organization, role }) => (
        <Card key={organization._id}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>{organization.name}</CardTitle>
              <Badge className={`${roleBadgeColor[role]} ml-6 capitalize`}>
                {role}
              </Badge>
            </div>
            <CardDescription>
              {organization.description ?? "No description provided."}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-between gap-3">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-3">
                <HugeiconsIcon icon={ChatBotIcon} />0
              </div>
              <Separator orientation="vertical" className="h-4" />
              <div className="flex items-center gap-3">
                <HugeiconsIcon icon={UserGroupIcon} />0
              </div>
            </div>
            <div className="flex items-center gap-6">
              <Button asChild>
                <Link href={`/dashboard/${organization.slug}`}>
                  <HugeiconsIcon icon={ArrowRight02Icon} />
                  Enter
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
