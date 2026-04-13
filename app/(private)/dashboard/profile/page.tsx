"use client";

import { Button } from "@/components/ui/button";
import { signOut } from "next-auth/react";

export default function ProfilePage() {
  return (
    <>
      <div>
        <h1>Profile Page</h1>
        <Button onClick={() => signOut({ callbackUrl: "/" })}>Sign Out</Button>
      </div>
    </>
  );
}
