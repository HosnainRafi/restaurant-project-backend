import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";

// Load environment variables
dotenv.config({ path: path.join(process.cwd(), ".env") });

// Import Models
import { User } from "../app/modules/user/user.model";
import { Restaurant } from "../app/modules/restaurant/restaurant.model";
import { MenuCategory } from "../app/modules/menuCategory/menuCategory.model";
import { MenuItem } from "../app/modules/menuItem/menuItem.model";
import { Reservation } from "../app/modules/reservation/reservation.model";
import { Order } from "../app/modules/order/order.model";

const seedDatabase = async () => {
  try {
    // 1. Connect to the Database
    const dbUrl = process.env.DATABASE_URL;
    if (!dbUrl) {
      throw new Error("DATABASE_URL is not defined in your .env file");
    }
    await mongoose.connect(dbUrl);
    console.log("🌱 Database connection established for seeding...");

    // 2. Clear Existing Data
    console.log("🧹 Clearing existing data...");
    await User.deleteMany({});
    await Restaurant.deleteMany({});
    await MenuCategory.deleteMany({});
    await MenuItem.deleteMany({});
    await Reservation.deleteMany({});
    await Order.deleteMany({});

    // 3. Create Admin User
    console.log("👤 Creating admin user...");
    const adminUser = await User.create({
      email: "admin@example.com",
      uid: "replace-with-real-firebase-uid",
      role: "admin",
    });

    // 4. Create Restaurant Profile (without slug)
    console.log("🍽️ Creating restaurant profile...");
    const restaurant = await Restaurant.create({
      name: "Urban Grill & Bites",
      brand: {
        primaryColor: "#c026d3",
        logoUrl: "https://example.com/logo.png",
        coverUrl: "https://example.com/cover.jpg",
      },
      branches: [
        {
          name: "Main Branch",
          phone: "+1 (555) 123-4567",
          address: "123 Culinary Lane, Foodie City, USA",
          isDefault: true,
        },
      ],
      about:
        "Urban Grill & Bites offers a modern dining experience with a focus on fresh, locally-sourced ingredients.",
      seo: {
        title: "Urban Grill & Bites | Modern American Cuisine",
        description:
          "Discover the best grill in town. We serve delicious steaks, burgers, and salads.",
      },
    });

    const restaurantId = restaurant._id;

    // 5. Create Menu Categories
    console.log("📚 Creating menu categories...");
    const categories = await MenuCategory.insertMany([
      { name: "Appetizers", restaurantId, displayOrder: 1 },
      { name: "Main Courses", restaurantId, displayOrder: 2 },
      { name: "Grill & Steaks", restaurantId, displayOrder: 3 },
      { name: "Desserts", restaurantId, displayOrder: 4 },
      { name: "Beverages", restaurantId, displayOrder: 5 },
    ]);

    const categoryMap = categories.reduce(
      (acc, category) => {
        acc[category.name] = category._id;
        return acc;
      },
      {} as Record<string, mongoose.Types.ObjectId>
    );

    // 6. Create Menu Items
    console.log("🍔 Creating menu items...");
    await MenuItem.insertMany([
      {
        name: "Spicy Tuna Tartare",
        description: "Fresh tuna with avocado and spicy mayo.",
        price: 1600,
        categoryId: categoryMap["Appetizers"],
        restaurantId,
        tags: ["spicy"],
      },
      {
        name: "Classic Cheeseburger",
        description: "Angus beef patty, cheddar cheese, and our special sauce.",
        price: 1800,
        categoryId: categoryMap["Main Courses"],
        restaurantId,
      },
      {
        name: "Ribeye Steak (12oz)",
        description: "A juicy, well-marbled ribeye cooked to perfection.",
        price: 4500,
        categoryId: categoryMap["Grill & Steaks"],
        restaurantId,
      },
      {
        name: "Chocolate Lava Cake",
        description: "Warm chocolate cake with a gooey molten center.",
        price: 1200,
        categoryId: categoryMap["Desserts"],
        restaurantId,
        tags: ["veg"],
      },
    ]);

    console.log("✅ Seeding completed successfully!");
  } catch (error) {
    console.error("❌ Error during seeding:", error);
    process.exit(1);
  } finally {
    // 7. Disconnect from the Database
    await mongoose.disconnect();
    console.log("🔌 Database connection closed.");
  }
};

seedDatabase();
