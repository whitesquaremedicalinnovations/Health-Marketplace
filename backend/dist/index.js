import http from "http";
import { Server } from "socket.io";
import dotenv from "dotenv";
import app from "./app.js";
import { handleUncaughtException } from "./middlewares/error-handler.js";
import { logger } from "./utils/logger.js";
import { registerSocketHandlers } from "./socket.js";
import { setSocketInstance } from "./controller/chat.controller.js";
dotenv.config();
handleUncaughtException();
const port = process.env.PORT || 8000;
const httpServer = http.createServer(app);
const io = new Server(httpServer, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"],
    },
});
// Share Socket.IO instance with chat controller for REST API integration
setSocketInstance(io);
registerSocketHandlers(io);
httpServer.listen(port, () => {
    logger.info(`Server is running at http://localhost:${port}`, {
        port,
        environment: process.env.NODE_ENV || "development",
    });
});
httpServer.on("error", (error) => {
    if (error.code === "EADDRINUSE") {
        logger.error(`Port ${port} is already in use.`, error);
    }
    else {
        logger.error(`Server startup error:`, error);
    }
    process.exit(1);
});
process.on("SIGTERM", () => {
    logger.info("SIGTERM received, shutting down gracefully");
    httpServer.close(() => {
        logger.info("Server closed");
        process.exit(0);
    });
});
process.on("SIGINT", () => {
    logger.info("SIGINT received, shutting down gracefully");
    httpServer.close(() => {
        logger.info("Server closed");
        process.exit(0);
    });
});
