import { IUser } from "./user.interface";
import { User } from "./user.model";

// This new service finds a user by UID or creates them if they don't exist.
const syncUser = async (payload: {
  uid: string;
  email: string;
}): Promise<IUser> => {
  const { uid, email } = payload;
  let user = await User.findOne({ uid });

  if (!user) {
    user = await User.create({
      uid,
      email,
      role: "customer", // Changed default role to 'customer'
    });
  }

  return user;
};

export const UserService = {
  syncUser,
};
