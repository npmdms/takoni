"use client";

import { signOut } from "next-auth/react";

export default function SignOutButton() {
  return (
    <button
      type="button"
      onClick={() => signOut({ callbackUrl: "/" })}
      className="inline-flex items-center gap-2"
    >
      {/* <LogOutIcon className="size-4" /> */}
      Sign Out
    </button>
  );
}
