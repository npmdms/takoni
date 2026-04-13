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
  updateOrganizationSchema,
  UpdateOrganizationValues,
} from "@/lib/validation/organization";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { HugeiconsIcon } from "@hugeicons/react";
import { Alert02Icon, EditIcon } from "@hugeicons/core-free-icons";

interface Props {
  disabled?: boolean;
  organization: {
    id: string;
    name: string;
    description?: string;
    supportEmail?: string;
    address?: string;
  };
}

export default function EditOrganization({ disabled, organization }: Props) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const router = useRouter();

  const form = useForm<UpdateOrganizationValues>({
    resolver: zodResolver(updateOrganizationSchema),
    defaultValues: {
      name: organization.name,
      description: organization.description ?? "",
      supportEmail: organization.supportEmail ?? "",
      address: organization.address ?? "",
    },
  });

  async function onSubmit(values: UpdateOrganizationValues) {
    setLoading(true);
    setServerError(null);

    try {
      const res = await fetch(`/api/organizations/${organization.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      const data = await res.json();
      if (!res.ok) {
        setServerError(data.error ?? "Failed to update organization");
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
      const res = await fetch(`/api/organizations/${organization.id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const data = await res.json();
        setServerError(data.error ?? "Failed to delete organization");
        return;
      }

      setOpen(false);
      router.push("/dashboard");
      router.refresh();
    } catch {
      setServerError("Unable to connect. Please try again.");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild disabled={disabled}>
        <Button variant={"outline"} size={"sm"}>
          <HugeiconsIcon icon={EditIcon} />
          Edit
        </Button>
      </SheetTrigger>
      <SheetContent className="overflow-y-auto pb-24">
        <SheetHeader>
          <SheetTitle>Edit Organization</SheetTitle>
          <SheetDescription>Update your organization details.</SheetDescription>
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
                      placeholder="Organization name"
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
                      placeholder="What does your organization do?"
                      className="h-24"
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
                      Support Email{" "}
                      <span className="text-muted-foreground">(optional)</span>
                    </FieldLabel>
                    <Input
                      {...field}
                      id="supportEmail"
                      type="email"
                      disabled={loading}
                      aria-invalid={fieldState.invalid}
                      placeholder="support@example.com"
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
                    <FieldLabel htmlFor="address">
                      Address{" "}
                      <span className="text-muted-foreground">(optional)</span>
                    </FieldLabel>
                    <Textarea
                      {...field}
                      id="address"
                      disabled={loading}
                      aria-invalid={fieldState.invalid}
                      placeholder="Jl. ..."
                      className="h-20"
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
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
                    {deleting ? "Deleting..." : "Delete Organization"}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will permanently delete{" "}
                      <span className="font-medium">{organization.name}</span>{" "}
                      and all its chatbots. This action cannot be undone.
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
