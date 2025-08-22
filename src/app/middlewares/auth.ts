import { NextFunction, Request, Response } from "express";
import httpStatus from "http-status";
import ApiError from "../../utils/ApiError";
import catchAsync from "../../shared/catchAsync";
import { TUserRole } from "../modules/user/user.interface";
import { User } from "../modules/user/user.model";
import admin from "../../config/firebase";

const auth = (...requiredRoles: TUserRole[]) => {
  return catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      throw new ApiError(httpStatus.UNAUTHORIZED, "You are not authorized!");
    }

    // 1. Verify the token using Firebase Admin SDK
    const decodedToken = await admin.auth().verifyIdToken(token);

    // 2. Find the user in MongoDB. They might not exist yet, which is OK for the /sync route.
    const user = await User.findOne({ uid: decodedToken.uid });

    // 3. THE KEY CHANGE: Only perform strict checks if roles are required for the route.
    // The /auth/sync route is called with auth() (no roles), so it will skip this block.
    // Admin routes called with auth('admin') will enter this block.
    if (requiredRoles.length > 0) {
      if (!user) {
        // Now this error is correctly thrown ONLY for users trying to access protected
        // routes without a database profile.
        throw new ApiError(
          httpStatus.FORBIDDEN,
          "User profile does not exist. Please complete sign-up."
        );
      }

      if (!requiredRoles.includes(user.role)) {
        throw new ApiError(
          httpStatus.FORBIDDEN,
          "You do not have permission to perform this action."
        );
      }
    }

    // 4. Attach user details to the request object.
    // The 'role' will be undefined for a new user, but that's fine.
    // The syncUser service will assign a default role.
    req.user = {
      ...decodedToken,
      role: user?.role || "customer", // Use optional chaining
    };

    next();
  });
};

export default auth;
