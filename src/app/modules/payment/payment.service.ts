import httpStatus from "http-status";
import Stripe from "stripe";
import ApiError from "../../../utils/ApiError";
import { IOrder } from "../order/order.interface";
import { Order } from "../order/order.model";
import { User } from "../user/user.model";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

// --- NEW FUNCTION to create a payment intent for an existing order ---
const createPaymentIntentForOrder = async (
  orderId: string,
  userId: string
): Promise<{ clientSecret: string | null }> => {
  // Find the order and ensure the user has permission to pay for it
  const order = await Order.findById(orderId);

  if (!order) {
    throw new ApiError(httpStatus.NOT_FOUND, "Order not found.");
  }

  // A customer can only pay for their own order
  if (order.customer.uid && order.customer.uid !== userId) {
    const user = await User.findOne({ uid: userId });
    if (user?.role !== "admin" && user?.role !== "staff") {
      throw new ApiError(
        httpStatus.FORBIDDEN,
        "You do not have permission to pay for this order."
      );
    }
  }

  if (order.paymentStatus === "paid") {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "This order has already been paid."
    );
  }

  // Create a new PaymentIntent with the order's total amount
  const paymentIntent = await stripe.paymentIntents.create({
    amount: order.total, // Amount in cents
    currency: "usd",
    payment_method_types: ["card"],
    metadata: { orderId: order._id.toString() },
  });

  // Save the new paymentIntentId to the order for tracking
  order.paymentIntentId = paymentIntent.id;
  await order.save();

  return {
    clientSecret: paymentIntent.client_secret,
  };
};

export const PaymentService = {
  createPaymentIntentForOrder,
};
