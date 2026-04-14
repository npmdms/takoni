"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { HugeiconsIcon } from "@hugeicons/react";
import { EyeIcon } from "@hugeicons/core-free-icons";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Knowledge {
  id: string;
  title: string;
  content: string;
  category: string;
  tags?: string[];
  isActive: boolean;
  createdAt: string;
}

interface Props {
  knowledge: Knowledge;
}

export default function ViewKnowledge({ knowledge }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm">
          <HugeiconsIcon icon={EyeIcon} />
          View
        </Button>
      </SheetTrigger>
      <SheetContent className="overflow-y-auto pb-24">
        <SheetHeader>
          <Badge
            className={
              knowledge.isActive
                ? "bg-emerald-500"
                : "bg-muted text-muted-foreground"
            }
          >
            {knowledge.isActive ? "Active" : "Inactive"}
          </Badge>
          <SheetTitle>{knowledge.title}</SheetTitle>
          <SheetDescription className="capitalize flex gap-1">
            Category:
            <span>{knowledge.category}</span>
          </SheetDescription>
          <SheetDescription className="flex gap-1">
            Created at:
            <span>
              {new Date(knowledge.createdAt).toLocaleDateString("id-ID", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </span>
          </SheetDescription>
          <p className="flex gap-1">
            Tags:{" "}
            <span className="flex flex-wrap gap-1">
              {knowledge.tags?.map((tag) => (
                <Badge
                  key={tag}
                  variant="outline"
                  className="capitalize text-xs"
                >
                  {tag}
                </Badge>
              ))}
            </span>
          </p>
          <Separator className="my-3" />
          <Card>
            <CardHeader>
              <CardTitle>Content</CardTitle>
            </CardHeader>
            <CardContent>{knowledge.content}</CardContent>
          </Card>
        </SheetHeader>
      </SheetContent>
    </Sheet>
    // <Sheet open={open} onOpenChange={setOpen}>
    //   <SheetTrigger asChild>
    //     <Button variant="ghost" size="icon">
    //       <HugeiconsIcon icon={EyeIcon} size={16} />
    //     </Button>
    //   </SheetTrigger>
    //   <SheetContent className="overflow-y-auto">
    //     <SheetHeader>
    //       <SheetTitle>{knowledge.title}</SheetTitle>
    //       <SheetDescription className="capitalize">
    //         {knowledge.category}
    //       </SheetDescription>
    //       <Separator />
    //     </SheetHeader>

    //     <div className="flex flex-col gap-6 px-4 py-4">
    //       <div className="flex flex-wrap items-center gap-2">
    //           {knowledge.isActive ? "Active" : "Inactive"}
    //         </Badge>
    //       </div>

    //       <Separator />

    //       <div className="flex flex-col gap-2">
    //         <p className="text-xs text-muted-foreground uppercase tracking-widest">
    //           Content
    //         </p>
    //         <p className="text-sm leading-relaxed whitespace-pre-wrap">
    //           {knowledge.content}
    //         </p>
    //       </div>

    //       <Separator />

    //       <div className="flex flex-col gap-1">
    //         <p className="text-xs text-muted-foreground uppercase tracking-widest">
    //           Added
    //         </p>
    //         <p className="text-sm text-muted-foreground">
    //         </p>
    //       </div>
    //     </div>
    //   </SheetContent>
    // </Sheet>
  );
}
