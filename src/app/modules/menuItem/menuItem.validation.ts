// src/app/modules/menuItem/menuItem.validation.ts
import { z } from "zod";

export const createMenuItemValidationSchema = z.object({
  body: z.object({
    categoryId: z.string({ required_error: "Category ID is required" }),
    name: z.string({ required_error: "Item name is required" }),
    description: z.string({ required_error: "Description is required" }),
    price: z
      .number({ required_error: "Price is required" })
      .positive("Price must be a positive number"),
    imageUrl: z.string().url().optional(),
    tags: z
      .array(z.enum(["spicy", "veg", "vegan", "gf", "nut-free"]))
      .optional(),
    calories: z.number().optional(),
    isAvailable: z.boolean().optional(),
    displayOrder: z.number().optional(),

    // Special flags
    isFeatured: z.boolean().optional(),
    isChefsRecommendation: z.boolean().optional(),
    isTodaysSpecial: z.boolean().optional(),
  }),
});

export const updateMenuItemValidationSchema = z.object({
  body: createMenuItemValidationSchema.shape.body.partial(),
});
