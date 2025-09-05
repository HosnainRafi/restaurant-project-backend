import dotenv from "dotenv";
import path from "path";

// dotenv.config({ path: path.join(process.cwd(), ".env") });

if (process.env.NODE_ENV !== "production") {
  dotenv.config({ path: path.join(process.cwd(), ".env") });
}

export default {
  env: process.env.NODE_ENV || "development",
  port: process.env.PORT || 5000,
  database_url: process.env.DATABASE_URL,
  client_origin: process.env.CLIENT_ORIGIN, // Make sure to export this
};
