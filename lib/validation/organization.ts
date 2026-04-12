import { z } from "zod";

export const addOrganizationSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(50, "Cannot exceed 50 characters"),
  description: z.string().max(256, "Cannot exceed 256 characters").optional(),
  supportEmail: z
    .string()
    .email("Please provide a valid support email address")
    .optional(),
  address: z.string().max(256, "Cannot exceed 256 characters").optional(),
});

export type AddOrganizationValues = z.infer<typeof addOrganizationSchema>;

export const updateOrganizationSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(50, "Cannot exceed 50 characters"),
  description: z.string().max(256, "Cannot exceed 256 characters").optional(),
  supportEmail: z.string().email("Invalid email").optional().or(z.literal("")),
  address: z.string().max(256, "Cannot exceed 256 characters").optional(),
});

export type UpdateOrganizationValues = z.infer<typeof updateOrganizationSchema>;
