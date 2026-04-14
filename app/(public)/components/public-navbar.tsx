import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { getSession } from "next-auth/react";
import Link from "next/link";

export default function PublicNavbar() {
  const session = getSession();
  const user = session;

  return (
    <>
      <nav className="flex flex-col bg-white text-sm">
        <div className="flex flex-row justify-between items-center p-3">
          <Link href={"/"} className="font-semibold">
            Takoni
          </Link>
          <ul className="flex items-center gap-3">
            <Button variant={"outline"} asChild>
              <Link href={"/sign-in"}>Sign In</Link>
            </Button>
            <Button variant={"default"} asChild>
              <Link href={"/sign-up"}>Sign Up</Link>
            </Button>
          </ul>
        </div>
        <Separator />
      </nav>
    </>
  );
}
