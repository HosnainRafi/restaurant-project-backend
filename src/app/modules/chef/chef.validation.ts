// src/app/modules/chef/chef.validation.ts
import { z } from "zod";

export const createChefValidationSchema = z.object({
  body: z.object({
    name: z.string({ required_error: "Name is required" }).min(1),
    email: z.string({ required_error: "Email is required" }).email(),
    phone: z.string().optional(),
    specialty: z.string().optional(),
    description: z.string().optional(),
    imageUrl: z.string().url().optional(), // from imgbb
    isActive: z.boolean().optional(),
    displayOrder: z.number().optional(),
  }),
});

export const updateChefValidationSchema = z.object({
  body: z.object({
    name: z.string().optional(),
    email: z.string().email().optional(),
    phone: z.string().optional(),
    specialty: z.string().optional(),
    description: z.string().optional(),
    imageUrl: z.string().url().optional(),
    isActive: z.boolean().optional(),
    displayOrder: z.number().optional(),
  }),
});
