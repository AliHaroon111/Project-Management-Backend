import dotenv from "dotenv";

dotenv.config({ path: "./.env" });

import app from "./app.js";
import connectDB from "./db/index.js";

const port = process.env.PORT || 3000;

connectDB()
    .then(() => {
        app.listen(port, () => {
            console.log(`🚀 Server running at http://localhost:${port}`);
            console.log(`📚 API Docs available at http://localhost:${port}/api/v1/docs`);
        });
    })
    .catch((err) => {
        console.error("MongoDB connection error:", err);
        process.exit(1);
    });