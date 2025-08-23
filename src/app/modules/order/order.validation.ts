import { z } from "zod";

const OrderItemSchema = z.object({
  menuItemId: z.string({ required_error: "Menu Item ID is required" }),
  quantity: z.number().min(1, "Quantity must be at least 1"),
});

export const createOrderValidationSchema = z.object({
  body: z.object({
    customer: z.object({
      name: z.string({ required_error: "Customer name is required" }),
      phone: z.string({ required_error: "Customer phone is required" }),
      email: z.string().email().optional(),
      address: z.string().optional(),
      uid: z.string().optional(),
    }),
    items: z
      .array(OrderItemSchema)
      .min(1, "Order must contain at least one item"),
    type: z.enum(["pickup", "delivery"]),
    tip: z.number().min(0).optional(),
    notes: z.string().optional(),
  }),
});

// ✅ New validation schema for status updates
export const updateOrderStatusValidationSchema = z.object({
  body: z.object({
    status: z.enum([
      "pending",
      "confirmed",
      "preparing",
      "ready",
      "completed",
      "cancelled",
    ]),
  }),
});
