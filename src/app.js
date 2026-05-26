import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import morgan from "morgan";
import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "./swagger/swagger.js";

const app = express();

// ─── Security + Logging ───────────────────────────────────────────────────────
app.use(helmet());
app.use(process.env.NODE_ENV !== "production" ? morgan("dev") : morgan("combined"));

// ─── Core Middleware ──────────────────────────────────────────────────────────
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());

// ─── CORS ─────────────────────────────────────────────────────────────────────
app.use(cors({
    origin: process.env.CORS_ORIGIN?.split(",") || "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
}));

// ─── API Docs ─────────────────────────────────────────────────────────────────
app.use("/api/v1/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec, { explorer: true }));

// ─── Routes ───────────────────────────────────────────────────────────────────
import healthCheckRouter from "./routes/healthcheck.routes.js";
import authRouter       from "./routes/auth.routes.js";
import taskRouter       from "./routes/task.routes.js";
import projectRouter    from "./routes/project.routes.js";   // NEW
import activityRouter   from "./routes/activity.routes.js";  // NEW

app.use("/api/v1/healthcheck", healthCheckRouter);
app.use("/api/v1/auth",        authRouter);
app.use("/api/v1/tasks",       taskRouter);
app.use("/api/v1/projects",    projectRouter);   // NEW
app.use("/api/v1/activity",    activityRouter);  // NEW

// ─── 404 ──────────────────────────────────────────────────────────────────────
app.use((req, res) => {
    res.status(404).json({ success: false, statusCode: 404, message: `Route ${req.originalUrl} not found` });
});

// ─── Global Error Handler ─────────────────────────────────────────────────────
import { ApiError } from "./utils/api-error.js";
import { ApiResponse } from "./utils/api-response.js";

app.use((err, req, res, next) => {
    if (err instanceof ApiError) {
        return res.status(err.statusCode).json(new ApiResponse(err.statusCode, null, err.message));
    }
    if (err.code === "LIMIT_FILE_SIZE") {
        return res.status(400).json(new ApiResponse(400, null, "File size exceeds 2MB limit"));
    }
    console.error("Unhandled error:", err);
    return res.status(500).json(new ApiResponse(500, null, "Internal server error"));
});

export default app;
