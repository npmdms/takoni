import { z } from "zod";

export const addOrganizationSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(20, "Cannot exceed 20 characters"),
  description: z.string().max(256, "Cannot exceed 256 characters").optional(),
  supportEmail: z
    .string()
    .email("Please provide a valid support email address")
    .optional(),
  address: z.string().optional(),
});

export type AddOrganizationValues = z.infer<typeof addOrganizationSchema>;
