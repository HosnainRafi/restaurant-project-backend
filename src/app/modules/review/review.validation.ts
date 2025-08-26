import { z } from "zod";

// For customers creating or updating their own review
export const customerReviewValidationSchema = z.object({
  body: z.object({
    orderId: z.string({ required_error: "Order ID is required" }).optional(),
    rating: z.number({ required_error: "Rating is required" }).min(1).max(5),
    comment: z
      .string({ required_error: "Comment is required" })
      .min(1)
      .max(500),
  }),
});

// For admins updating the 'isFeatured' status
export const adminReviewUpdateValidationSchema = z.object({
  body: z.object({
    isFeatured: z.boolean({ required_error: "isFeatured flag is required" }),
  }),
});
