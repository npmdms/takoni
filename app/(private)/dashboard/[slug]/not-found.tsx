import Link from "next/link";
import { Button } from "@/components/ui/button";
import { HugeiconsIcon } from "@hugeicons/react";
import { SadIcon } from "@hugeicons/core-free-icons";

export default function NotFound() {
  return (
    <div className="min-h-[75vh] grid grid-cols-1 place-items-center">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col justify-center items-center">
          <HugeiconsIcon size={64} icon={SadIcon} />
          <h1 className="text-xl md:text-2xl">Not found</h1>
          <p className="text-sm text-muted-foreground text-balance">
            What you&apos;re looking for doesn&apos;t exist or you don&apos;t
            have access to it.
          </p>
        </div>
        <Button asChild>
          <Link href={"/dashboard"}>Back to dashboard</Link>
        </Button>
      </div>
    </div>
  );
}
