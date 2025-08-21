import mongoose from "mongoose";
import app from "./app";
import config from "./config";
import { Server } from "http";

let server: Server;

async function bootstrap() {
  try {
    if (!config.database_url) {
      throw new Error("DATABASE_URL is not defined in environment variables");
    }
    await mongoose.connect(config.database_url);
    console.log("✅ Database connected successfully");

    server = app.listen(config.port, () => {
      console.log(`🚀 Application listening on port ${config.port}`);
    });
  } catch (err) {
    console.error("❌ Failed to connect to database", err);
    process.exit(1);
  }

  const exitHandler = () => {
    if (server) {
      server.close(() => {
        console.log("Server closed");
        process.exit(1);
      });
    } else {
      process.exit(1);
    }
  };

  process.on("unhandledRejection", (reason) => {
    console.error("Unhandled Rejection at:", reason);
    exitHandler();
  });

  process.on("uncaughtException", (error) => {
    console.error("Uncaught Exception thrown", error);
    exitHandler();
  });

  process.on("SIGTERM", () => {
    console.log("SIGTERM is received");
    exitHandler();
  });
}

bootstrap();
