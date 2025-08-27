import cors from "cors";
import express, { Express, Request, Response } from "express";
import userRoutes from "./routes/user.routes.ts";
import clinicRoutes from "./routes/clinic.routes.ts";
import doctorRoutes from "./routes/doctor.routes.ts";
import adminRoutes from "./routes/admin.routes.ts";
import patientRoutes from "./routes/patient.routes.ts";
import chatRoutes from "./routes/chat.routes.ts";
import messageRoutes from "./routes/messages.routes.ts";
import { errorHandler } from "./middlewares/error-handler.ts";
import { logger } from "./utils/logger.ts";
import paymentsRoutes from "./routes/payments.routes.ts";
import uploadRoutes from "./routes/upload.routes.ts";
import notificationRoutes from "./routes/notification.routes.ts";
const app: Express = express();

app.set("trust proxy", 1);

app.use((req, res, next) => {
  const start = Date.now();
  res.on("finish", () => {
    const duration = Date.now() - start;
    logger.request(req.method, req.originalUrl, res.statusCode, duration, {
      userAgent: req.get("User-Agent"),
      ip: req.ip,
    });
  });
  next();
});

app.use(cors({
  origin: "*",
  credentials: true,
}));

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Health check
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// API routes
app.use("/api/user", userRoutes);
app.use("/api/clinic", clinicRoutes);
app.use("/api/doctor", doctorRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/patient", patientRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/payments", paymentsRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/notification", notificationRoutes);

// 404
app.use("*", (req, res) => {
  res.status(404).json({
    success: false,
    error: {
      code: "RESOURCE_NOT_FOUND",
      message: `Route ${req.originalUrl} not found`,
      timestamp: new Date().toISOString(),
      path: req.originalUrl,
    },
  });
});

app.use(errorHandler);

export default app;
