"use client";

import { Button } from "@/components/ui/button";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  createChatbotSchema,
  CreateChatbotValues,
} from "@/lib/validation/chatbot";
import { zodResolver } from "@hookform/resolvers/zod";
import { AddIcon, Alert02Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";

interface Props {
  organizationId: string;
  slug: string;
}

export default function CreateChatbot({ organizationId, slug }: Props) {
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const form = useForm<CreateChatbotValues>({
    resolver: zodResolver(createChatbotSchema),
    defaultValues: {
      name: "",
      description: "",
      systemPrompt: "",
      welcomeMessage: "",
      isActive: false,
      requirePreChat: false,
    },
  });

  async function onSubmit(values: CreateChatbotValues) {
    setLoading(true);
    setServerError(null);

    try {
      const res = await fetch(`/api/organizations/${organizationId}/chatbots`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });

      const data = await res.json();

      if (!res.ok) {
        setServerError(data.error ?? "Failed to create chatbot");
        return;
      }

      form.reset();
      setOpen(false);
      router.refresh();
    } catch (error) {
      setServerError("Unable to connect. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button>
            <HugeiconsIcon icon={AddIcon} />
            Add Chatbot
          </Button>
        </SheetTrigger>
        <SheetContent className="overflow-y-auto pb-24">
          <SheetHeader>
            <SheetTitle>Add Chatbot</SheetTitle>
            <SheetDescription>Please fill out</SheetDescription>
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
                      <FieldLabel htmlFor="name">Chatbot Name</FieldLabel>
                      <Input
                        {...field}
                        id="name"
                        disabled={loading}
                        aria-invalid={fieldState.invalid}
                        placeholder="Name"
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
                      <FieldLabel htmlFor="description">Description</FieldLabel>
                      <Textarea
                        {...field}
                        id="description"
                        disabled={loading}
                        aria-invalid={fieldState.invalid}
                        placeholder="What does your organization do?"
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
                        <span className="text-muted-foreground">
                          (optional)
                        </span>
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
                        <span className="text-muted-foreground">
                          (optional)
                        </span>
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

                {serverError && (
                  <p className="text-sm text-destructive text-balance flex items-center gap-1 py-3">
                    <HugeiconsIcon icon={Alert02Icon} />
                    {serverError}
                  </p>
                )}

                <Button type="submit" disabled={loading}>
                  {loading ? "Creating..." : "Create"}
                </Button>
              </FieldGroup>
            </form>
          </SheetHeader>
        </SheetContent>
      </Sheet>
    </>
  );
}
