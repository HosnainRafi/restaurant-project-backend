import { z } from "zod";

export const createReviewValidationSchema = z.object({
  body: z.object({
    orderId: z.string({ required_error: "Order ID is required" }),
    rating: z
      .number({ required_error: "Rating is required" })
      .min(1, "Rating must be at least 1")
      .max(5, "Rating must be at most 5"),
    comment: z
      .string({ required_error: "Comment is required" })
      .min(1, "Comment cannot be empty")
      .max(500, "Comment cannot exceed 500 characters"),
  }),
});
