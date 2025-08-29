import { z } from "zod";

// --- START: MODIFICATIONS AND ADDITIONS ---

// Define a schema for a single address to reuse it
const addressSchema = z.object({
  label: z.string().min(1, "Address label is required"),
  details: z.string().min(1, "Address details are required"),
});

export const userSyncValidationSchema = z.object({
  body: z.object({
    name: z.string().min(1, "Full name is required"),
    email: z.string().email("A valid email is required"),
    address: addressSchema.optional(),
  }),
});

// New validation schema specifically for profile updates
export const updateUserValidationSchema = z.object({
  body: z.object({
    name: z.string().min(1, "Full name is required").optional(),
    photoURL: z.string().url("Must be a valid URL").optional(),
    addresses: z.array(addressSchema).optional(),
  }),
});

// --- END: MODIFICATIONS AND ADDITIONS ---

export const loginUserValidationSchema = z.object({
  body: z.object({
    email: z.string().email("Email is required"),
    password: z.string().min(1, "Password is required"),
  }),
});

export const changePasswordValidationSchema = z.object({
  body: z
    .object({
      newPassword: z
        .string()
        .min(6, "Password must be at least 6 characters long"),
      confirmPassword: z.string(),
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
      message: "Passwords do not match",
      path: ["confirmPassword"], // Point error to the confirmPassword field
    }),
});
export const updateUserStatusValidationSchema = z.object({
  body: z.object({
    status: z.enum(['active', 'blocked'], {
      required_error: 'Status is required',
    }),
  }),
});
