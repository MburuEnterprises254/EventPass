import { z } from "zod";

export const registerSchema = z
  .object({
    email: z.email("A valid email address is required"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .max(128, "Password is too long"),
    name: z.string().trim().min(1, "Name is required").max(120).optional(),
  })
  .strict();

export const signInSchema = z
  .object({
    email: z.email("A valid email address is required"),
    password: z.string().min(1, "Password is required"),
  })
  .strict();

export type RegisterInput = z.infer<typeof registerSchema>;
export type SignInInput = z.infer<typeof signInSchema>;
