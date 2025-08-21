import { z } from "zod";

export const createUserValidationSchema = z.object({
  body: z.object({
    email: z.string().email("A valid email is required"),
    password: z.string().min(6, "Password must be at least 6 characters long"),
    role: z.enum(["admin", "staff"]).optional(),
  }),
});

export const loginUserValidationSchema = z.object({
  body: z.object({
    email: z.string().email("Email is required"),
    password: z.string().min(1, "Password is required"),
  }),
});
