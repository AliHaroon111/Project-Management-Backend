import { ApiError } from "./utils/api-error.js";
import { ApiResponse } from "./utils/api-response.js";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import morgan from "morgan";
import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "./swagger/swagger.js";
import taskRouter from "./routes/task.routes.js";
const app = express();

// Secure HTTP headers and set environment-specific request logging 
app.use(helmet());

if (process.env.NODE_ENV !== "production") {
    app.use(morgan("dev"));
} else {
    app.use(morgan("combined"));
}

// Basic (Middleware) Configuarations
app.use(express.json({limit :"16kb"})) // i allowed json file
app.use(express.urlencoded({extended:true,limit:"16kb"}))  //For URL
app.use(express.static("public")) //TO access publically

//Cookie-parser
app.use(cookieParser()) // now you have access to cookies

// CORS Configuarations - CORS (allow frontend to access API)
app.use(cors( { //this cors take configrable object
    origin : process.env.CORS_ORIGIN ?.split(",") || "http://localhost:5173", //Should be .split(",") for multiple origins
    credentials : true,
    methods:["GET","POST","PUT","PATCH","DELETE","OPTIONS"],//METHOD SUPPOTED BY US
    allowedHeaders:["Content-Type","Authorization"],
}))


// Import the routes
import  healthCheckRouter from "./routes/healthcheck.routes.js"
import authRouter from "./routes/auth.routes.js"

app.use("/api/v1/healthcheck",healthCheckRouter) // for others we use get-->/nameonly
app.use("/api/v1/auth", authRouter)
app.use("/api/v1/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec, { explorer: true }));
app.use("/api/v1/tasks", taskRouter);

app.get('/home', (req, res) => {
    res.send('Welcome to basecamp')
  })

  //  error handler
  app.use((err, req, res, next) => {
    if (err instanceof ApiError) {
        return res.status(err.statusCode).json(
            new ApiResponse(err.statusCode, null, err.message)
        );
    }
    if (err.code === "LIMIT_FILE_SIZE") {
        return res.status(400).json(new ApiResponse(400, null, "File size exceeds 2MB limit"));
    }
    console.error("Unhandled error:", err);
    return res.status(500).json(new ApiResponse(500, null, "Internal server error"));
});

  export default app;