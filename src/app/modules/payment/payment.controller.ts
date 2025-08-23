import type { Request, Response } from "express";
import Stripe from "stripe";
import { OrderService } from "../order/order.service"; // 👈 Import OrderService
import { Order } from "../order/order.model";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import httpStatus from "http-status";
import { PaymentService } from "./payment.service";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: "2025-07-30.basil",
});

const createPaymentIntentForOrder = catchAsync(
  async (req: Request, res: Response) => {
    const { orderId } = req.body;
    const result = await PaymentService.createPaymentIntentForOrder(
      orderId,
      req.user.uid
    );
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Payment intent created successfully",
      data: result,
    });
  }
);

export const createPaymentIntent = async (req: Request, res: Response) => {
  try {
    const { amount, orderId } = req.body; // 👈 Get orderId from the body
    if (!amount || amount < 50 || !orderId) {
      return res
        .status(400)
        .json({ error: "Invalid amount or missing orderId" });
    }

    // Find the order to ensure it exists and the amount matches
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }
    if (order.total !== amount) {
      return res.status(400).json({ error: "Amount mismatch" });
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: "usd",
      automatic_payment_methods: { enabled: true },
      // --- NEW ---
      // Add the orderId to the metadata so we can find it in the webhook
      metadata: {
        orderId: orderId,
      },
    });

    // Save the paymentIntentId to the order
    order.paymentIntentId = paymentIntent.id;
    await order.save();

    return res.json({
      data: { clientSecret: paymentIntent.client_secret },
    });
  } catch (err: any) {
    console.error("Stripe error:", err.message);
    return res.status(500).json({ error: err.message });
  }
};

export const stripeWebhook = async (req: Request, res: Response) => {
  const sig = req.headers["stripe-signature"] as string | undefined;
  if (!sig || !process.env.STRIPE_WEBHOOK_SECRET) {
    return res.status(400).send("Missing signature or webhook secret");
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err: any) {
    console.error("Webhook signature verification failed.", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    switch (event.type) {
      case "payment_intent.succeeded": {
        const pi = event.data.object as Stripe.PaymentIntent;
        const orderId = pi.metadata.orderId;

        if (orderId) {
          // --- NEW ---
          // Use a service to update the order's payment status
          await OrderService.handleSuccessfulPayment(orderId);
          console.log(`✅ Order ${orderId} marked as paid.`);
        }
        break;
      }

      case "payment_intent.payment_failed": {
        const pi = event.data.object as Stripe.PaymentIntent;
        console.warn("Payment failed:", pi.last_payment_error?.message);
        break;
      }

      default:
        // other events you care about
        break;
    }

    return res.json({ received: true });
  } catch (err) {
    console.error("Webhook handler error:", err);
    return res.status(500).send("Webhook handler error");
  }
};

export const PaymentController = {
  createPaymentIntentForOrder,
};
