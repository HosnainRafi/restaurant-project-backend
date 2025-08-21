import { z } from "zod";

const BranchSchema = z.object({
  name: z.string(),
  phone: z.string(),
  address: z.string(),
  isDefault: z.boolean(),
});

export const createRestaurantValidationSchema = z.object({
  body: z.object({
    name: z.string(),
    brand: z.object({
      primaryColor: z.string(),
      logoUrl: z.string().url(),
      coverUrl: z.string().url(),
    }),
    branches: z.array(BranchSchema).min(1, "At least one branch is required"),
    social: z
      .object({
        facebook: z.string().url().optional(),
        instagram: z.string().url().optional(),
        yelpUrl: z.string().url().optional(),
      })
      .optional(),
    deliveryLinks: z
      .object({
        doorDash: z.string().url().optional(),
        uberEats: z.string().url().optional(),
        grubHub: z.string().url().optional(),
      })
      .optional(),
    features: z
      .object({
        halal: z.boolean().optional(),
        vegFriendly: z.boolean().optional(),
        parking: z.boolean().optional(),
        wifi: z.boolean().optional(),
      })
      .optional(),
    about: z.string(),
    seo: z.object({
      title: z.string(),
      description: z.string(),
    }),
  }),
});

export const updateRestaurantValidationSchema =
  createRestaurantValidationSchema.deepPartial();
