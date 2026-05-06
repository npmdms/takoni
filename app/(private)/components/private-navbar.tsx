"use client";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { LogoutIcon, MenuIcon, UserIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { signOut } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function PrivateNavbar() {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  return (
    <nav className="flex flex-col bg-white text-sm">
      <div className="flex flex-row justify-between items-center p-3">
        <Link href={"/dashboard"} className="font-semibold">
          Web Chatbot
        </Link>

        <ul className="hidden md:flex items-center gap-3">
          <Button
            variant={"outline"}
            size={"sm"}
            onClick={() => router.push("/dashboard/profile")}
          >
            <HugeiconsIcon icon={UserIcon} />
            Profile
          </Button>
          <Button
            onClick={() => signOut({ callbackUrl: "/" })}
            size={"sm"}
            variant={"destructive"}
          >
            <HugeiconsIcon icon={LogoutIcon} />
            Sign Out
          </Button>
        </ul>

        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild className="md:hidden">
            <Button size={"icon-sm"}>
              <HugeiconsIcon icon={MenuIcon} />
            </Button>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>Menu</SheetTitle>
              <SheetDescription>Bla bla bla</SheetDescription>
              <Separator className="my-3" />
              <ul className="flex flex-col gap-1">
                <Button
                  variant={"outline"}
                  size={"sm"}
                  onClick={() => setOpen(false)}
                  asChild
                >
                  <Link href={"/dashboard/profile"}>
                    <HugeiconsIcon icon={UserIcon} />
                    Profile
                  </Link>
                </Button>
                <Button
                  onClick={() => signOut({ callbackUrl: "/" })}
                  size={"sm"}
                  variant={"destructive"}
                >
                  <HugeiconsIcon icon={LogoutIcon} />
                  Sign Out
                </Button>
              </ul>
            </SheetHeader>
          </SheetContent>
        </Sheet>
      </div>
      <Separator />
    </nav>
  );
}
