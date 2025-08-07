
import cors from "cors";
import express, { type Express } from "express";
import userRoutes from "./routes/user.routes.ts";
import clinicRoutes from "./routes/clinic.routes.ts";
import doctorRoutes from "./routes/doctor.routes.ts";
import adminRoutes from "./routes/admin.routes.ts";
import { logger } from "./middlewares/logger.ts";

const app: Express = express();

// Middlewares
app.use(cors(
    {
        origin: ["http://localhost:3000", "http://localhost:3001", "http://localhost:3002", "http://localhost:3003"],
        credentials: true,
    }
));
app.use(express.json());
app.use(logger)
app.use(express.urlencoded({ extended: true }));

app.use("/api/user", userRoutes);
app.use("/api/clinic", clinicRoutes);
app.use("/api/doctor", doctorRoutes);
app.use("/api/admin", adminRoutes);




export default app;