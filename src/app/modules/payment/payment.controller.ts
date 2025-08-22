// import Stripe from "stripe";
// import config from "../../../config";
// import catchAsync from "../../../shared/catchAsync";
// import sendResponse from "../../../shared/sendResponse";
// import httpStatus from "http-status";
// import { Request, Response } from "express"; // 👈 Import Request and Response types

// //const stripe = new Stripe(config.stripe_secret_key as string);
// //const webhookSecret = config.stripe_webhook_secret as string; // 👈 Define the webhook secret

// const createPaymentIntent = catchAsync(async (req: Request, res: Response) => {
//   const { amount } = req.body; // Amount should be in cents

//   if (!amount || amount < 1) {
//     return res
//       .status(httpStatus.BAD_REQUEST)
//       .json({ message: "Invalid amount" });
//   }

//   const paymentIntent = await stripe.paymentIntents.create({
//     amount: amount,
//     currency: "usd",
//     automatic_payment_methods: {
//       enabled: true,
//     },
//   });

//   sendResponse(res, {
//     statusCode: httpStatus.OK,
//     success: true,
//     message: "Payment intent created successfully",
//     data: {
//       clientSecret: paymentIntent.client_secret,
//     },
//   });
// });

// const stripeWebhook = catchAsync(async (req: Request, res: Response) => {
//   const sig = req.headers["stripe-signature"] as string;
//   let event: Stripe.Event;

//   try {
//     event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
//   } catch (err: any) {
//     console.error(`❌ Error message: ${err.message}`);
//     return res.status(400).send(`Webhook Error: ${err.message}`);
//   }

//   // Handle the event
//   switch (event.type) {
//     case "payment_intent.succeeded":
//       const paymentIntentSucceeded = event.data.object;
//       // This is where you handle a successful payment.
//       // For example, find the order in your database using metadata and update its status to "Paid".
//       console.log("✅ Payment succeeded:", paymentIntentSucceeded.id);
//       break;
//     // ... handle other event types as needed
//     default:
//       console.log(`Unhandled event type ${event.type}`);
//   }

//   // Return a 200 response to acknowledge receipt of the event
//   res.json({ received: true });
// });

// export const PaymentController = {
//   createPaymentIntent,
//   stripeWebhook, // 👈 Export the new controller
// };
import type { Request, Response } from "express";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
    apiVersion: "2025-07-30.basil",
});

export const createPaymentIntent = async (req: Request, res: Response) => {
  try {
    const { amount, currency = "usd" } = req.body;
    if (!amount || amount < 50) {
      return res.status(400).json({ error: "Invalid amount" });
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency,
      automatic_payment_methods: { enabled: true },
    });

    return res.json({
      data: { clientSecret: paymentIntent.client_secret },
    });
  } catch (err: any) {
    console.error("Stripe error:", err.message);
    return res.status(500).json({ error: err.message });
  }
};

/**
 * Optional: Webhook to get authoritative status updates (e.g., 3DS).
 * You MUST register the endpoint in your Stripe Dashboard and set STRIPE_WEBHOOK_SECRET.
 * IMPORTANT: the webhook route must use `express.raw` body and be registered BEFORE `express.json()`.
 */
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
        // TODO: mark order as paid using pi.id or metadata.orderId
        // await Orders.markPaid(pi.id, pi.metadata?.orderId)
        break;
      }
      case "payment_intent.payment_failed": {
        const pi = event.data.object as Stripe.PaymentIntent;
        // TODO: handle failed payment (notify, clean up, etc.)
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
