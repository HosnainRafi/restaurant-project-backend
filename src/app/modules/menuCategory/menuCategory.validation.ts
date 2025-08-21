import { z } from "zod";

export const createMenuCategoryValidationSchema = z.object({
  body: z.object({
    name: z.string({ required_error: "Category name is required" }),
    description: z.string().optional(),
    displayOrder: z.number().optional(),
  }),
});

export const updateMenuCategoryValidationSchema = z.object({
  body: z.object({
    name: z.string().optional(),
    description: z.string().optional(),
    displayOrder: z.number().optional(),
  }),
});
