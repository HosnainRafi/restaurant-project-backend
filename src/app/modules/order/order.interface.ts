import { Model, Types } from "mongoose";

export interface IOrderItem {
  menuItemId: Types.ObjectId;
  name: string;
  quantity: number;
  price: number; // Price in cents at the time of order
}

export interface IOrder {
  customerId?: Types.ObjectId;
  restaurantId: Types.ObjectId;
  orderNumber: string;
  customer: {
    name: string;
    phone: string;
    email?: string;
    address?: string; // For delivery
  };
  items: IOrderItem[];
  subtotal: number; // in cents
  tax: number; // in cents
  tip?: number; // in cents
  total: number; // in cents
  status:
    | "pending"
    | "confirmed"
    | "preparing"
    | "ready"
    | "completed"
    | "cancelled";
  type: "pickup" | "delivery";
  notes?: string;
  // --- NEW FIELDS ---
  paymentStatus: "paid" | "unpaid";
  paymentIntentId?: string; // To store the Stripe Payment Intent ID
}

export interface OrderModel extends Model<IOrder> {}
