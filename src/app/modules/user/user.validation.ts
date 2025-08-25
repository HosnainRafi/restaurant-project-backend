import { z } from "zod";

// --- START: MODIFICATIONS AND ADDITIONS ---

// Define a schema for a single address to reuse it
const addressSchema = z.object({
  label: z.string().min(1, "Address label is required"),
  details: z.string().min(1, "Address details are required"),
});

// Updated validation for the user sync/creation endpoint
export const userSyncValidationSchema = z.object({
  body: z.object({
    name: z.string().min(1, "Full name is required"),
    email: z.string().email("A valid email is required"),
    address: addressSchema,
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
