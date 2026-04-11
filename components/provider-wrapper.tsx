"use client";

import { SessionProvider } from "next-auth/react";

export function ProviderWrapper({ children }: { children: React.ReactNode }) {
  return <SessionProvider>{children}</SessionProvider>;
}
