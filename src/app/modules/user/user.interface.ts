import { Model } from "mongoose";

// --- ADDED: Interface for a single address ---
export interface IAddress {
  label: string; // e.g., "Home", "Work"
  details: string; // The full address string
}

export type TUserRole = "admin" | "manager" | "staff" | "customer";
export type TUserStatus = 'active' | 'blocked';
export interface IUser {
  uid: string; // Firebase Unique ID
  email: string;
  role: TUserRole;
  status: TUserStatus;
  // --- ADDED: New fields for the user profile ---
  name: string;
  photoURL?: string; // Optional: for the profile picture
  addresses?: IAddress[]; // An array to hold multiple addresses
}

export interface UserModel extends Model<IUser> {
  isUserExistingByEmail(email: string): Promise<IUser | null>;
}
