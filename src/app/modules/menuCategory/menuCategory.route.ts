import express from "express";
import validateRequest from "../../middlewares/validateRequest";
import { MenuCategoryController } from "./menuCategory.controller";
import { createMenuCategoryValidationSchema } from "./menuCategory.validation";

const router = express.Router();

router.post(
  "/",
  // auth('admin'),
  validateRequest(createMenuCategoryValidationSchema),
  MenuCategoryController.createMenuCategory
);

router.get(
  "/",
  // This can be a public route
  MenuCategoryController.getAllMenuCategories
);
// For delete
router.delete("/:categoryId", MenuCategoryController.deleteMenuCategory);

export const MenuCategoryRoutes = router;
