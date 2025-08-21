import { NextFunction, Request, Response } from "express";
import httpStatus from "http-status";
import ApiError from "../../utils/ApiError";
import catchAsync from "../../shared/catchAsync";
import { TUserRole } from "../modules/user/user.interface";
import { User } from "../modules/user/user.model";
import admin from "../../config/firebase"; // Import the initialized Firebase Admin

const auth = (...requiredRoles: TUserRole[]) => {
  return catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      throw new ApiError(httpStatus.UNAUTHORIZED, "You are not authorized!");
    }

    // Verify the token using Firebase Admin SDK
    const decodedToken = await admin.auth().verifyIdToken(token);

    // Find the user in your MongoDB database using the Firebase UID
    const user = await User.findOne({ uid: decodedToken.uid });
    if (!user) {
      // This can happen if the user exists in Firebase but not in your DB yet.
      // The frontend should call a 'sync' endpoint to create the user profile.
      throw new ApiError(
        httpStatus.FORBIDDEN,
        "User profile does not exist. Please complete sign-up."
      );
    }

    // Check if the user role from your DB matches the required roles
    if (requiredRoles.length && !requiredRoles.includes(user.role)) {
      throw new ApiError(
        httpStatus.FORBIDDEN,
        "You do not have permission to perform this action."
      );
    }

    // Attach the decoded token and your user profile to the request
    req.user = {
      ...decodedToken,
      role: user.role, // Add role from your DB
    };

    next();
  });
};

export default auth;
