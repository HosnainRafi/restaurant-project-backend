import express from "express";
import { UserRoutes } from "../modules/user/user.route";
import { ReservationRoutes } from "../modules/reservation/reservation.route";
import { MenuCategoryRoutes } from "../modules/menuCategory/menuCategory.route";
import { MenuItemRoutes } from "../modules/menuItem/menuItem.route";
import { OrderRoutes } from "../modules/order/order.route";
import { RestaurantRoutes } from "../modules/restaurant/restaurant.route";
import { PaymentRoutes } from "../modules/payment/payment.route";
import { ChefRoutes } from "../modules/chef/chef.route";
import { CustomerRoutes } from "../modules/customer/customer.route";
import { NotificationRoutes } from "../modules/notification/notification.route";
import { ReviewRoutes } from "../modules/review/review.route";

const router = express.Router();

const moduleRoutes = [
  { path: "/auth", route: UserRoutes },
  { path: "/reservations", route: ReservationRoutes },
  { path: "/menu-categories", route: MenuCategoryRoutes },
  { path: "/menu-items", route: MenuItemRoutes },
  { path: "/orders", route: OrderRoutes },
  { path: "/restaurant", route: RestaurantRoutes },
  { path: "/payment", route: PaymentRoutes },
  { path: "/chefs", route: ChefRoutes },
  { path: "/customer", route: CustomerRoutes },
  { path: "/notifications", route: NotificationRoutes },
  { path: "/reviews", route: ReviewRoutes },
];

moduleRoutes.forEach((route) => router.use(route.path, route.route));

export default router;
