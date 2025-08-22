import { Server } from "socket.io";
import type { Server as HTTPServer } from "http";
import config from "../config";

let io: Server | null = null;

export const initSocket = (server: HTTPServer) => {
  io = new Server(server, {
    cors: {
      origin: config.client_origin || "*", // your React app URL in prod
      methods: ["GET", "POST", "PATCH"],
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    const restaurantId = String(socket.handshake.query.restaurantId || "");
    if (restaurantId) {
      socket.join(restaurantId);
      socket.emit("socket:joined", { restaurantId });
      console.log(`Socket ${socket.id} joined ${restaurantId}`);
    }
    socket.on("disconnect", () => {
      console.log(`Socket ${socket.id} disconnected`);
    });
  });

  return io;
};

export const getIO = () => {
  if (!io) throw new Error("Socket.IO is not initialized!");
  return io;
};
