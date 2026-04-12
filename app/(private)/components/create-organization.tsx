"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { Textarea } from "@/components/ui/textarea";
import {
  addOrganizationSchema,
  AddOrganizationValues,
} from "@/lib/validation/organization";
import { zodResolver } from "@hookform/resolvers/zod";
import { Alert02Icon, PlusSignIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";

export default function CreateOrganization() {
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const form = useForm<AddOrganizationValues>({
    resolver: zodResolver(addOrganizationSchema),
    defaultValues: {
      name: "",
      description: "",
      supportEmail: "",
      address: "",
    },
  });

  async function onSubmit(values: AddOrganizationValues) {
    setLoading(true);
    setServerError(null);

    try {
      const res = await fetch("/api/organizations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      const result = await res.json();

      if (!res.ok) {
        setServerError(
          result.error ?? "Something went wrong. Please try again.",
        );
        return;
      }

      form.reset();
      setOpen(false);
      router.refresh();
    } catch {
      setServerError(
        "Unable to connect. Please check your connection and try again.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger>
          <Card className="hover:shadow-md transition duration-300 hover:cursor-pointer">
            <CardHeader className="grid grid-cols-1 place-items-center">
              <HugeiconsIcon icon={PlusSignIcon} />
              <CardTitle>Add Organization</CardTitle>
            </CardHeader>
          </Card>
        </SheetTrigger>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Add Organization</SheetTitle>
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
                      <FieldLabel htmlFor="name">Organization Name</FieldLabel>
                      <Input
                        {...field}
                        id="name"
                        disabled={loading}
                        aria-invalid={fieldState.invalid}
                        placeholder="Name"
                        autoComplete="name"
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
                  name="supportEmail"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="supportEmail">
                        Support Email
                      </FieldLabel>
                      <Input
                        {...field}
                        id="supportEmail"
                        type="email"
                        disabled={loading}
                        aria-invalid={fieldState.invalid}
                        placeholder="support@example.com"
                        autoComplete="email"
                      />
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />

                <Controller
                  name="address"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="address">Address</FieldLabel>
                      <Textarea
                        {...field}
                        id="address"
                        disabled={loading}
                        aria-invalid={fieldState.invalid}
                        placeholder="123 Main St, New York, NY 10856"
                      />
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />

                {serverError && (
                  <p className="text-sm text-destructive text-balance flex items-center gap-1">
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
