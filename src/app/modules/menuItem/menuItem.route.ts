// src/app/modules/menuItem/menuItem.route.ts
import express from "express";
import validateRequest from "../../middlewares/validateRequest";
import { MenuItemController } from "./menuItem.controller";
import {
  createMenuItemValidationSchema,
  updateMenuItemValidationSchema,
} from "./menuItem.validation";
// import auth from '../../middlewares/auth';

const router = express.Router();

router.post(
  "/",
  // auth('admin'),
  validateRequest(createMenuItemValidationSchema),
  MenuItemController.createMenuItem
);

router.get(
  "/special",
  // Public route
  MenuItemController.getSpecialMenuItems
);

router.get(
  "/",
  // Public route
  MenuItemController.getMenuItems
);

router.patch(
  "/:id",
  // auth('admin'),
  validateRequest(updateMenuItemValidationSchema),
  MenuItemController.updateMenuItem
);

router.delete(
  "/:id",
  // auth('admin'),
  MenuItemController.deleteMenuItem
);

export const MenuItemRoutes = router;
