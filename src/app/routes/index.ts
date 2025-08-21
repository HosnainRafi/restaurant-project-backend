import express from "express";
import { UserRoutes } from "../modules/user/user.route";
import { ReservationRoutes } from "../modules/reservation/reservation.route";
import { MenuCategoryRoutes } from "../modules/menuCategory/menuCategory.route";
import { MenuItemRoutes } from "../modules/menuItem/menuItem.route";
import { OrderRoutes } from "../modules/order/order.route";
import { RestaurantRoutes } from "../modules/restaurant/restaurant.route";

const router = express.Router();

const moduleRoutes = [
  { path: "/auth", route: UserRoutes },
  { path: "/reservations", route: ReservationRoutes },
  { path: "/menu-categories", route: MenuCategoryRoutes },
  { path: "/menu-items", route: MenuItemRoutes },
  { path: "/orders", route: OrderRoutes },
  { path: "/restaurant", route: RestaurantRoutes },
];

moduleRoutes.forEach((route) => router.use(route.path, route.route));

export default router;
