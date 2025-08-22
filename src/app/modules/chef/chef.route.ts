// src/app/modules/chef/chef.route.ts
import express from "express";
import validateRequest from "../../middlewares/validateRequest";
import { ChefController } from "./chef.controller";
import {
  createChefValidationSchema,
  updateChefValidationSchema,
} from "./chef.validation";

const router = express.Router();

router.post(
  "/",
  // auth('admin'),
  validateRequest(createChefValidationSchema),
  ChefController.createChef
);

router.get(
  "/",
  // public
  ChefController.getChefs
);

router.patch(
  "/:id",
  // auth('admin'),
  validateRequest(updateChefValidationSchema),
  ChefController.updateChef
);

router.delete(
  "/:id",
  // auth('admin'),
  ChefController.deleteChef
);

export const ChefRoutes = router;
