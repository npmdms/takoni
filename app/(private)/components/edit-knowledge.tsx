"use client";

import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  createKnowledgeSchema,
  CreateKnowledgeValues,
  KNOWLEDGE_CATEGORIES,
} from "@/lib/validation/knowledge";
import { HugeiconsIcon } from "@hugeicons/react";
import { Alert02Icon } from "@hugeicons/core-free-icons";

interface Knowledge {
  id: string;
  title: string;
  content: string;
  category: string;
  tags?: string[];
  isActive: boolean;
}

interface Props {
  open: boolean;
  onOpenChange: (val: boolean) => void;
  organizationId: string;
  chatbotId: string;
  knowledge: Knowledge;
}

export default function EditKnowledge({
  open,
  onOpenChange,
  organizationId,
  chatbotId,
  knowledge,
}: Props) {
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [tagInput, setTagInput] = useState("");
  const router = useRouter();

  const form = useForm<CreateKnowledgeValues>({
    resolver: zodResolver(createKnowledgeSchema),
    defaultValues: {
      title: knowledge.title,
      content: knowledge.content,
      category: knowledge.category as CreateKnowledgeValues["category"],
      tags: knowledge.tags ?? [],
      isActive: knowledge.isActive,
    },
  });

  useEffect(() => {
    form.reset({
      title: knowledge.title,
      content: knowledge.content,
      category: knowledge.category as CreateKnowledgeValues["category"],
      tags: knowledge.tags ?? [],
      isActive: knowledge.isActive,
    });
  }, [knowledge.id]);

  function onTagKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      const tag = tagInput.trim().toLowerCase();
      if (!tag) return;
      const current = form.getValues("tags") ?? [];
      if (current.includes(tag) || current.length >= 10) return;
      form.setValue("tags", [...current, tag]);
      setTagInput("");
    }
    if (e.key === "Backspace" && !tagInput) {
      const current = form.getValues("tags") ?? [];
      form.setValue("tags", current.slice(0, -1));
    }
  }

  function removeTag(tag: string) {
    const current = form.getValues("tags") ?? [];
    form.setValue(
      "tags",
      current.filter((t) => t !== tag),
    );
  }

  async function onSubmit(values: CreateKnowledgeValues) {
    setLoading(true);
    setServerError(null);

    try {
      const res = await fetch(
        `/api/organizations/${organizationId}/chatbots/${chatbotId}/knowledge/${knowledge.id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(values),
        },
      );

      const data = await res.json();
      if (!res.ok) {
        setServerError(data.error ?? "Failed to update knowledge");
        return;
      }

      onOpenChange(false);
      router.refresh();
    } catch {
      setServerError("Unable to connect. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function onDelete() {
    setDeleting(true);
    try {
      const res = await fetch(
        `/api/organizations/${organizationId}/chatbots/${chatbotId}/knowledge/${knowledge.id}`,
        { method: "DELETE" },
      );

      if (!res.ok) {
        const data = await res.json();
        setServerError(data.error ?? "Failed to delete knowledge");
        return;
      }

      onOpenChange(false);
      router.refresh();
    } catch {
      setServerError("Unable to connect. Please try again.");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="overflow-y-auto pb-24">
        <SheetHeader>
          <SheetTitle>Edit Knowledge</SheetTitle>
          <SheetDescription>Update this knowledge entry.</SheetDescription>
          <Separator className="my-3" />
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-col gap-1"
          >
            <FieldGroup>
              <Controller
                name="title"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="title">Title</FieldLabel>
                    <Input
                      {...field}
                      id="title"
                      disabled={loading}
                      aria-invalid={fieldState.invalid}
                      placeholder="e.g. Refund Policy"
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />

              <Controller
                name="category"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="category">Category</FieldLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      disabled={loading}
                    >
                      <SelectTrigger
                        id="category"
                        aria-invalid={fieldState.invalid}
                      >
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                      <SelectContent>
                        {KNOWLEDGE_CATEGORIES.map((cat) => (
                          <SelectItem
                            key={cat}
                            value={cat}
                            className="capitalize"
                          >
                            {cat}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />

              <Controller
                name="tags"
                control={form.control}
                render={({ field }) => (
                  <Field>
                    <FieldLabel>
                      Tags
                      <span className="text-muted-foreground ml-1 font-normal">
                        (optional, max 10)
                      </span>
                    </FieldLabel>
                    <div className="flex flex-wrap gap-1.5 min-h-10 w-full rounded-md border px-3 py-2 focus-within:ring-1 focus-within:ring-ring">
                      {(field.value ?? []).map((tag) => (
                        <span
                          key={tag}
                          className="flex items-center gap-1 bg-muted text-muted-foreground text-xs px-2 py-0.5 rounded-full"
                        >
                          {tag}
                          <button
                            type="button"
                            onClick={() => removeTag(tag)}
                            className="hover:text-foreground"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                      <input
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        onKeyDown={onTagKeyDown}
                        placeholder={
                          (field.value ?? []).length === 0
                            ? "Type and press Enter..."
                            : ""
                        }
                        disabled={loading}
                        className="flex-1 min-w-20 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Press Enter or comma to add a tag
                    </p>
                  </Field>
                )}
              />

              <Controller
                name="content"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="content">
                      Content
                      <span className="text-muted-foreground ml-1 font-normal">
                        (max 2000 characters)
                      </span>
                    </FieldLabel>
                    <Textarea
                      {...field}
                      id="content"
                      disabled={loading}
                      aria-invalid={fieldState.invalid}
                      placeholder="Write the information your chatbot should know..."
                      className="h-44"
                    />
                    <p className="text-xs text-muted-foreground text-right">
                      {field.value?.length ?? 0} / 2000
                    </p>
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />

              <Controller
                name="isActive"
                control={form.control}
                render={({ field }) => (
                  <Field>
                    <div className="flex items-center justify-between">
                      <div className="flex flex-col gap-1">
                        <FieldLabel htmlFor="isActive">Active</FieldLabel>
                        <p className="text-sm text-muted-foreground">
                          Include this knowledge when answering questions
                        </p>
                      </div>
                      <Switch
                        id="isActive"
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        disabled={loading}
                      />
                    </div>
                  </Field>
                )}
              />
            </FieldGroup>

            {serverError && (
              <p className="text-sm text-destructive text-balance flex items-center gap-1 py-3">
                <HugeiconsIcon icon={Alert02Icon} />
                {serverError}
              </p>
            )}

            <div className="flex flex-col gap-3 pt-3">
              <Button type="submit" disabled={loading} className="w-full">
                {loading ? "Saving..." : "Save Changes"}
              </Button>

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    type="button"
                    variant="destructive"
                    className="w-full"
                    disabled={deleting}
                  >
                    {deleting ? "Deleting..." : "Delete Knowledge"}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will permanently delete{" "}
                      <span className="font-medium">{knowledge.title}</span>.
                      This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={onDelete}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </form>
        </SheetHeader>
      </SheetContent>
    </Sheet>
  );
}
