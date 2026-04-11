import { z } from "zod";

export const signUpSchema = z.object({
  email: z.string().email("Please provide a valid email address"),
  password: z.string().min(8, "Password should be at least 8 characters"),
  username: z
    .string()
    .min(1, "Please create a username.")
    .regex(/^[a-zA-Z0-9]+$/, { message: "Only alphanumeric characters are allowed" }),
  emailPreferences: z.boolean(),
});

export type SignUpFormValues = z.infer<typeof signUpSchema>;