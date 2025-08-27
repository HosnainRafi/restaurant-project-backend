import { NextFunction, Request, Response } from "express";
import httpStatus from "http-status";
import ApiError from "../../utils/ApiError"; // Make sure your firebase-admin is initialized and exported
import { TUserRole } from "../modules/user/user.interface";
import { User } from "../modules/user/user.model";
import { admin } from "../lib/firebaseAdmin";

// This is the main auth middleware
const auth = (...requiredRoles: TUserRole[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // 1. Get the token from the Authorization header
      const token = req.headers.authorization?.split(" ")[1];
      console.log(token);
      if (!token) {
        throw new ApiError(httpStatus.UNAUTHORIZED, "You are not authorized!");
      }

      // --- 2. THIS IS THE CORE FIX ---
      // Use the Firebase Admin SDK to verify the ID token.
      // This method returns a `DecodedIdToken` object, which is exactly what your services need.
      const decodedToken = await admin.auth().verifyIdToken(token);
      console.log(decodedToken);
      // 3. Check for roles if the route requires them
      if (requiredRoles.length > 0) {
        // For protected routes, we need to ensure the user exists in our database
        // and has the correct role.
        const userInDb = await User.findOne({ uid: decodedToken.uid });
        console.log(userInDb);
        if (!userInDb) {
          throw new ApiError(
            httpStatus.FORBIDDEN,
            "Forbidden: User profile not found in database."
          );
        }

        if (!requiredRoles.includes(userInDb.role)) {
          throw new ApiError(
            httpStatus.FORBIDDEN,
            "Forbidden: You don't have permission to access this resource."
          );
        }
      }

      // 4. Attach the fully typed and verified user object to the request.
      // Now, req.user is guaranteed to be of type `DecodedIdToken`.
      req.user = decodedToken;

      next();
    } catch (error) {
      // Handle potential errors like expired tokens or invalid signatures
      next(new ApiError(httpStatus.UNAUTHORIZED, "Authentication failed"));
    }
  };
};

export default auth;
