import { z } from "zod";

export const createReservationValidationSchema = z.object({
  body: z.object({
    // --- UPDATED: Expect a nested customer object ---
    customer: z.object({
      name: z
        .string({ required_error: "Name is required" })
        .min(2, "Name must be at least 2 characters"),
      phone: z
        .string({ required_error: "Phone number is required" })
        .min(10, "Please enter a valid phone number"),
      email: z.string().email("Please enter a valid email address").optional(),
    }),
    partySize: z.coerce
      .number()
      .min(1, "Party size must be at least 1")
      .max(20, "For parties over 20, please call us directly"),
    date: z
      .string({ required_error: "Date is required" })
      .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format"),
    time: z
      .string({ required_error: "Time is required" })
      .regex(/^\d{2}:\d{2}$/, "Time must be in HH:MM format"),
    note: z.string().max(250, "Note cannot exceed 250 characters").optional(),
  }),
});

export const updateReservationStatusValidationSchema = z.object({
  body: z.object({
    status: z.enum(["approved", "declined", "cancelled"]),
  }),
});
