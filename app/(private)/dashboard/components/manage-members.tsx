"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { HugeiconsIcon } from "@hugeicons/react";
import { UserGroupIcon } from "@hugeicons/core-free-icons";

type MemberRow = {
  _id: string;
  role: "owner" | "member";
  user:
    | string
    | {
        _id: string;
        email?: string;
        username?: string;
      };
};

function getUserLabel(user: MemberRow["user"]) {
  if (typeof user === "string") return user;
  return user.username || user.email || user._id;
}

function getUserEmail(user: MemberRow["user"]) {
  if (typeof user === "string") return null;
  return user.email ?? null;
}

export default function ManageMembers({
  disabled,
  organizationId,
  organizationName,
}: {
  disabled?: boolean;
  organizationId: string;
  organizationName: string;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [inviting, setInviting] = useState(false);
  const [kickingId, setKickingId] = useState<string | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);
  const [members, setMembers] = useState<MemberRow[]>([]);
  const [email, setEmail] = useState("");

  const sortedMembers = useMemo(() => {
    return [...members].sort((a, b) => {
      if (a.role !== b.role) return a.role === "owner" ? -1 : 1;
      return getUserLabel(a.user).localeCompare(getUserLabel(b.user));
    });
  }, [members]);

  async function loadMembers() {
    setLoading(true);
    setServerError(null);
    try {
      const res = await fetch(`/api/organizations/${organizationId}/members`, {
        method: "GET",
      });
      const data = await res.json();
      if (!res.ok) {
        setServerError(data.error ?? "Failed to load members");
        return;
      }
      setMembers(Array.isArray(data) ? data : []);
    } catch {
      setServerError("Unable to connect. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!open) return;
    void loadMembers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  async function invite() {
    const trimmed = email.trim().toLowerCase();
    if (!trimmed) return;

    setInviting(true);
    setServerError(null);
    try {
      const res = await fetch(`/api/organizations/${organizationId}/members`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: trimmed }),
      });
      const data = await res.json();
      if (!res.ok) {
        setServerError(data.error ?? "Failed to invite member");
        return;
      }
      setEmail("");
      await loadMembers();
      router.refresh();
    } catch {
      setServerError("Unable to connect. Please try again.");
    } finally {
      setInviting(false);
    }
  }

  async function kick(membershipId: string) {
    setKickingId(membershipId);
    setServerError(null);
    try {
      const res = await fetch(
        `/api/organizations/${organizationId}/members/${membershipId}`,
        { method: "DELETE" },
      );
      const data = await res.json();
      if (!res.ok) {
        setServerError(data.error ?? "Failed to remove member");
        return;
      }
      await loadMembers();
      router.refresh();
    } catch {
      setServerError("Unable to connect. Please try again.");
    } finally {
      setKickingId(null);
    }
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild disabled={disabled}>
        <Button variant="outline" size="sm">
          <HugeiconsIcon icon={UserGroupIcon} />
          Members
        </Button>
      </SheetTrigger>
      <SheetContent className="overflow-y-auto pb-24">
        <SheetHeader>
          <SheetTitle>Manage members</SheetTitle>
          <SheetDescription>
            Invite and remove members for{" "}
            <span className="font-medium">{organizationName}</span>.
          </SheetDescription>
          <Separator className="my-3" />

          <div className="flex flex-col gap-3">
            <div className="flex gap-2">
              <Input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Invite by email"
                type="email"
                autoComplete="email"
                disabled={inviting || loading}
              />
              <Button
                type="button"
                onClick={invite}
                disabled={!email.trim() || inviting || loading}
              >
                {inviting ? "Inviting..." : "Invite"}
              </Button>
            </div>

            {serverError && (
              <p className="text-sm text-destructive">{serverError}</p>
            )}

            <Separator className="my-1" />

            <div className="flex flex-col gap-2">
              {loading ? (
                <p className="text-sm text-muted-foreground">Loading...</p>
              ) : sortedMembers.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No members found.
                </p>
              ) : (
                sortedMembers.map((m) => {
                  const label = getUserLabel(m.user);
                  const memberEmail = getUserEmail(m.user);
                  const canKick = m.role !== "owner";
                  const kicking = kickingId === m._id;

                  return (
                    <div
                      key={m._id}
                      className="flex items-center justify-between gap-3 rounded-md border p-3"
                    >
                      <div className="flex min-w-0 flex-col">
                        <div className="flex items-center gap-2 min-w-0">
                          <p className="text-sm font-medium truncate">
                            {label}
                          </p>
                          <Badge
                            className={`capitalize ${m.role === "owner" ? "bg-emerald-500" : "bg-muted text-muted-foreground"}`}
                          >
                            {m.role}
                          </Badge>
                        </div>
                        {memberEmail && (
                          <p className="text-xs text-muted-foreground truncate">
                            {memberEmail}
                          </p>
                        )}
                      </div>

                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        disabled={!canKick || kickingId !== null}
                        onClick={() => kick(m._id)}
                      >
                        {kicking ? "Removing..." : "Kick"}
                      </Button>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </SheetHeader>
      </SheetContent>
    </Sheet>
  );
}
