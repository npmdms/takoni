"use client";

import { Button } from "@/components/ui/button";
import { signOut, useSession } from "next-auth/react";

export default function DashboardPage() {
  const { data: session } = useSession();

  return (
    <>
      <div className="flex flex-col">
        <p>ID: {session?.user.id}</p>
        <p>Email: {session?.user?.email}</p>
        <p>Username: {session?.user.username}</p>
        <Button onClick={() => signOut({ callbackUrl: "/" })}>Sign Out</Button>
      </div>
    </>
  );
}
