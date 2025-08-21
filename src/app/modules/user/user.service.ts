import { IUser } from "./user.interface";
import { User } from "./user.model";

// This new service finds a user by UID or creates them if they don't exist.
const syncUser = async (payload: {
  uid: string;
  email: string;
}): Promise<IUser> => {
  const { uid, email } = payload;

  // Find user by Firebase UID
  let user = await User.findOne({ uid });

  // If user doesn't exist, create a new one in your DB
  if (!user) {
    user = await User.create({
      uid,
      email,
      role: "staff", // Assign a default role
    });
  }

  return user;
};

export const UserService = {
  syncUser,
};
