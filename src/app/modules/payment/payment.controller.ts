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
