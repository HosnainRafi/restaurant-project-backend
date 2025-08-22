import express from "express";
import { UserController } from "./user.controller";
import auth from "../../middlewares/auth"; // The new Firebase auth middleware

const router = express.Router();

// This endpoint is called by the frontend after a successful Firebase login
// to ensure a user profile exists in our database.
router.post(
  "/sync",
  auth(), // We use auth() to ensure only valid Firebase users can sync
  UserController.syncUser // A new controller we need to create
);

router.get("/me", auth(), UserController.getMe);

export const UserRoutes = router;
