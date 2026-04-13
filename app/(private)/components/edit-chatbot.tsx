"use client";

import { Button } from "@/components/ui/button";
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
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
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
  updateChatbotSchema,
  UpdateChatbotValues,
} from "@/lib/validation/chatbot";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { HugeiconsIcon } from "@hugeicons/react";
import { Alert02Icon, EditIcon } from "@hugeicons/core-free-icons";

interface Props {
  chatbot: {
    id: string;
    organizationId: string;
    name: string;
    description?: string;
    systemPrompt?: string;
    welcomeMessage?: string;
    isActive: boolean;
    requirePreChat: boolean;
  };
}

export default function EditChatbot({ chatbot }: Props) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const router = useRouter();

  const form = useForm<UpdateChatbotValues>({
    resolver: zodResolver(updateChatbotSchema),
    defaultValues: {
      name: chatbot.name,
      description: chatbot.description ?? "",
      systemPrompt: chatbot.systemPrompt ?? "",
      welcomeMessage: chatbot.welcomeMessage ?? "",
      isActive: chatbot.isActive,
      requirePreChat: chatbot.requirePreChat,
    },
  });

  async function onSubmit(values: UpdateChatbotValues) {
    setLoading(true);
    setServerError(null);

    try {
      const res = await fetch(
        `/api/organizations/${chatbot.organizationId}/chatbots/${chatbot.id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(values),
        },
      );

      const data = await res.json();
      if (!res.ok) {
        setServerError(data.error ?? "Failed to update chatbot");
        return;
      }

      setOpen(false);
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
        `/api/organizations/${chatbot.organizationId}/chatbots/${chatbot.id}`,
        { method: "DELETE" },
      );

      if (!res.ok) {
        const data = await res.json();
        setServerError(data.error ?? "Failed to delete chatbot");
        return;
      }

      setOpen(false);
      router.refresh();
    } catch {
      setServerError("Unable to connect. Please try again.");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm">
            <HugeiconsIcon icon={EditIcon} />
          Edit
        </Button>
      </SheetTrigger>
      <SheetContent className="overflow-y-auto pb-24">
        <SheetHeader>
          <SheetTitle>Edit Chatbot</SheetTitle>
          <SheetDescription>Update your chatbot settings.</SheetDescription>
          <Separator className="my-3" />
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-col gap-1"
          >
            <FieldGroup>
              <Controller
                name="name"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="name">Name</FieldLabel>
                    <Input
                      {...field}
                      id="name"
                      disabled={loading}
                      aria-invalid={fieldState.invalid}
                      placeholder="e.g. Support Bot"
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />

              <Controller
                name="description"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="description">
                      Description{" "}
                      <span className="text-muted-foreground">(optional)</span>
                    </FieldLabel>
                    <Textarea
                      {...field}
                      id="description"
                      disabled={loading}
                      aria-invalid={fieldState.invalid}
                      placeholder="What does this chatbot do?"
                      className="h-44"
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />

              <Controller
                name="systemPrompt"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="systemPrompt">
                      System Prompt{" "}
                      <span className="text-muted-foreground">(optional)</span>
                    </FieldLabel>
                    <Textarea
                      {...field}
                      id="systemPrompt"
                      disabled={loading}
                      aria-invalid={fieldState.invalid}
                      placeholder="You are a helpful assistant for..."
                      className="h-24"
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />

              <Controller
                name="welcomeMessage"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="welcomeMessage">
                      Welcome Message{" "}
                      <span className="text-muted-foreground">(optional)</span>
                    </FieldLabel>
                    <Input
                      {...field}
                      id="welcomeMessage"
                      disabled={loading}
                      aria-invalid={fieldState.invalid}
                      placeholder="Hi! How can I help you today?"
                    />
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
                          Widget will be visible on your website
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

              <Controller
                name="requirePreChat"
                control={form.control}
                render={({ field }) => (
                  <Field>
                    <div className="flex items-center justify-between">
                      <div className="flex flex-col gap-1">
                        <FieldLabel htmlFor="requirePreChat">
                          Require Pre-chat Form
                        </FieldLabel>
                        <p className="text-sm text-muted-foreground">
                          Ask visitor for name and email before chatting
                        </p>
                      </div>
                      <Switch
                        id="requirePreChat"
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
                    {deleting ? "Deleting..." : "Delete Chatbot"}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will permanently delete{" "}
                      <span className="font-medium">{chatbot.name}</span> and
                      all its data. This action cannot be undone.
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
