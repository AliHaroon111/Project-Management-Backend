import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import morgan from "morgan";
import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "./swagger/swagger.js";

const app = express();

// ─── Security Headers (Helmet) ────────────────────────────────────────────────
app.use(helmet());

// ─── HTTP Request Logging (Morgan) ────────────────────────────────────────────
if (process.env.NODE_ENV !== "production") {
    app.use(morgan("dev"));
} else {
    app.use(morgan("combined"));
}

// ─── Core Middleware ──────────────────────────────────────────────────────────
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());

// ─── CORS ─────────────────────────────────────────────────────────────────────
app.use(
    cors({
        origin: process.env.CORS_ORIGIN?.split(",") || "http://localhost:5173",
        credentials: true,
        methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization"],
    })
);

// ─── API Documentation (Swagger) ──────────────────────────────────────────────
app.use(
    "/api/v1/docs",
    swaggerUi.serve,
    swaggerUi.setup(swaggerSpec, {
        explorer: true,
        customSiteTitle: "Project Management API Docs",
    })
);

// ─── Routes ───────────────────────────────────────────────────────────────────
import healthCheckRouter from "./routes/healthcheck.routes.js";
import authRouter from "./routes/auth.routes.js";
import taskRouter from "./routes/task.routes.js";

app.use("/api/v1/healthcheck", healthCheckRouter);
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/tasks", taskRouter);

// ─── 404 Handler ─────────────────────────────────────────────────────────────
app.use((req, res) => {
    res.status(404).json({
        success: false,
        statusCode: 404,
        message: `Route ${req.originalUrl} not found`,
    });
});

// ─── Global Error Handler ─────────────────────────────────────────────────────
// handler existed — unhandled errors leaked stack traces to clients
// Must have exactly 4 params for Express to treat it as error middleware
import { ApiError } from "./utils/api-error.js";
import { ApiResponse } from "./utils/api-response.js";

app.use((err, req, res, next) => {
    if (err instanceof ApiError) {
        return res.status(err.statusCode).json(
            new ApiResponse(err.statusCode, null, err.message)
        );
    }

    // Multer file size error
    if (err.code === "LIMIT_FILE_SIZE") {
        return res.status(400).json(
            new ApiResponse(400, null, "File size exceeds 2MB limit")
        );
    }

    console.error("Unhandled error:", err);
    return res.status(500).json(
        new ApiResponse(500, null, "Internal server error")
    );
});

export default app;
