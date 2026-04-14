"use client";

import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Field, FieldLabel, FieldGroup } from "@/components/ui/field";
import {
  appearanceSchema,
  AppearanceValues,
  CHATBOT_COLORS,
  CHATBOT_POSITIONS,
  CHATBOT_SIZES,
} from "@/lib/validation/appearance";
import { HugeiconsIcon } from "@hugeicons/react";
import { Alert02Icon, Tick02Icon } from "@hugeicons/core-free-icons";

const COLOR_MAP: Record<string, { bg: string; label: string }> = {
  slate: { bg: "bg-slate-500", label: "Slate" },
  red: { bg: "bg-red-500", label: "Red" },
  orange: { bg: "bg-orange-500", label: "Orange" },
  green: { bg: "bg-green-500", label: "Green" },
  blue: { bg: "bg-blue-500", label: "Blue" },
  violet: { bg: "bg-violet-500", label: "Violet" },
  pink: { bg: "bg-pink-500", label: "Pink" },
};

const SIZE_MAP: Record<string, { label: string; desc: string }> = {
  sm: { label: "Small", desc: "Compact, less intrusive" },
  md: { label: "Medium", desc: "Balanced, recommended" },
  lg: { label: "Large", desc: "More visible, spacious" },
};

const POSITION_MAP: Record<string, { label: string }> = {
  "bottom-right": { label: "Bottom right" },
  "bottom-left": { label: "Bottom left" },
};

interface Props {
  organizationId: string;
  chatbotId: string;
  chatbotName: string;
  appearance: AppearanceValues;
}

export default function AppearanceForm({
  organizationId,
  chatbotId,
  chatbotName,
  appearance,
}: Props) {
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const router = useRouter();

  const form = useForm<AppearanceValues>({
    resolver: zodResolver(appearanceSchema),
    defaultValues: appearance,
  });

  const watchedColor = form.watch("color");
  const watchedSize = form.watch("size");
  const watchedPosition = form.watch("position");

  async function onSubmit(values: AppearanceValues) {
    setLoading(true);
    setServerError(null);
    setSaved(false);

    try {
      const res = await fetch(
        `/api/organizations/${organizationId}/chatbots/${chatbotId}/appearance`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(values),
        },
      );

      const data = await res.json();
      if (!res.ok) {
        setServerError(data.error ?? "Failed to save appearance");
        return;
      }

      setSaved(true);
      router.refresh();
    } catch {
      setServerError("Unable to connect. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const initials = chatbotName
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col gap-6"
      >
        <FieldGroup>
          <Controller
            name="color"
            control={form.control}
            render={({ field }) => (
              <Field>
                <FieldLabel>Color</FieldLabel>
                <div className="flex flex-wrap gap-2 mt-1">
                  {CHATBOT_COLORS.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => field.onChange(color)}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-md border text-sm transition-colors ${
                        field.value === color
                          ? "border-foreground"
                          : "border-border hover:border-muted-foreground"
                      }`}
                    >
                      <span
                        className={`w-3 h-3 rounded-full ${COLOR_MAP[color].bg}`}
                      />
                      {COLOR_MAP[color].label}
                    </button>
                  ))}
                </div>
              </Field>
            )}
          />

          <Separator />

          <Controller
            name="size"
            control={form.control}
            render={({ field }) => (
              <Field>
                <FieldLabel>Widget size</FieldLabel>
                <div className="flex flex-col gap-2 mt-1">
                  {CHATBOT_SIZES.map((size) => (
                    <button
                      key={size}
                      type="button"
                      onClick={() => field.onChange(size)}
                      className={`flex items-center justify-between px-4 py-3 rounded-md border text-sm text-left transition-colors ${
                        field.value === size
                          ? "border-foreground"
                          : "border-border hover:border-muted-foreground"
                      }`}
                    >
                      <span className="font-medium">
                        {SIZE_MAP[size].label}
                      </span>
                      <span className="text-muted-foreground text-xs">
                        {SIZE_MAP[size].desc}
                      </span>
                    </button>
                  ))}
                </div>
              </Field>
            )}
          />

          <Separator />

          <Controller
            name="position"
            control={form.control}
            render={({ field }) => (
              <Field>
                <FieldLabel>Position</FieldLabel>
                <div className="flex gap-2 mt-1">
                  {CHATBOT_POSITIONS.map((pos) => (
                    <button
                      key={pos}
                      type="button"
                      onClick={() => field.onChange(pos)}
                      className={`flex-1 px-4 py-3 rounded-md border text-sm transition-colors ${
                        field.value === pos
                          ? "border-foreground"
                          : "border-border hover:border-muted-foreground"
                      }`}
                    >
                      {POSITION_MAP[pos].label}
                    </button>
                  ))}
                </div>
              </Field>
            )}
          />

          {serverError && (
            <p className="text-sm text-destructive text-balance flex items-center gap-1">
              <HugeiconsIcon icon={Alert02Icon} />
              {serverError}
            </p>
          )}

          {saved && (
            <p className="text-sm text-green-500 text-balance flex items-center gap-1">
              <HugeiconsIcon icon={Tick02Icon} />
              Appearance updated
            </p>
          )}

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "Saving..." : "Save appearance"}
          </Button>
        </FieldGroup>
      </form>

      <div className="flex flex-col gap-6">
        <h1 className="text-xl md:text-2xl">Preview</h1>
        <Card className="relative overflow-hidden aspect-video flex items-end p-4">
          <p className="absolute top-4 left-4 text-xs text-muted-foreground">
            yourwebsite.com
          </p>

          <div
            className={`absolute flex flex-col gap-2 ${
              watchedPosition === "bottom-right"
                ? "right-4 bottom-4"
                : "left-4 bottom-4"
            }`}
          >
            <div
              className={`bg-background border rounded-xl shadow-lg flex flex-col overflow-hidden ${
                watchedSize === "sm"
                  ? "w-44"
                  : watchedSize === "lg"
                    ? "w-64"
                    : "w-52"
              }`}
            >
              <div
                className={`flex items-center gap-2 px-3 py-2 ${COLOR_MAP[watchedColor].bg}`}
              >
                <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-white text-[9px] font-medium shrink-0">
                  {initials}
                </div>
                <span className="text-white text-xs font-medium truncate">
                  {chatbotName}
                </span>
              </div>

              <div className="px-3 py-2 flex flex-col gap-1.5">
                <div className="bg-muted rounded-lg px-2 py-1.5 text-[9px] text-muted-foreground max-w-[80%]">
                  Hi! How can I help you?
                </div>
                <div
                  className={`rounded-lg px-2 py-1.5 text-[9px] text-white max-w-[80%] self-end ${COLOR_MAP[watchedColor].bg}`}
                >
                  I need help
                </div>
              </div>

              <div className="px-2 pb-2">
                <div className="border rounded-md px-2 py-1 text-[9px] text-muted-foreground flex items-center justify-between">
                  <span>Type a message...</span>
                  <div
                    className={`w-4 h-4 rounded flex items-center justify-center ${COLOR_MAP[watchedColor].bg}`}
                  >
                    <span className="text-white text-[8px]">↑</span>
                  </div>
                </div>
              </div>
            </div>

            <div
              className={`self-end w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-medium shadow-md ${COLOR_MAP[watchedColor].bg}`}
            >
              {initials}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
