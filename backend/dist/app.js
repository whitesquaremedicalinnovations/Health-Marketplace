import cors from "cors";
import express from "express";
import userRoutes from "./routes/user.routes.js";
import clinicRoutes from "./routes/clinic.routes.js";
import doctorRoutes from "./routes/doctor.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import { logger } from "./middlewares/logger.js";
const app = express();
// Middlewares
app.use(cors({
    origin: ["http://localhost:3000", "http://localhost:3001", "http://localhost:3002", "http://localhost:3003"],
    credentials: true,
}));
app.use(express.json());
app.use(logger);
app.use(express.urlencoded({ extended: true }));
app.use("/api/user", userRoutes);
app.use("/api/clinic", clinicRoutes);
app.use("/api/doctor", doctorRoutes);
app.use("/api/admin", adminRoutes);
export default app;
