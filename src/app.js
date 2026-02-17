import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

// Basic (Middleware) Configuarations
app.use(express.json({limit :"16kb"})) // i allowed json file
app.use(express.urlencoded({extended:true,limit:"16kb"}))  //For URL
app.use(express.static("public")) //TO access publically

//Cookie-parser
app.use(cookieParser()) // now you have access to cookies

// CORS Configuarations - CORS (allow frontend to access API)
app.use(cors( { //this cors take configrable object
    origin : process.env.CORS_ORIGIN ?.split("") || "http://localhost:5173", //Should be .split(",") for multiple origins
    credentials : true,
    methods:["GET","POST","PUT","PATCH","DELETE","OPTIONS"],//METHOD SUPPOTED BY US
    allowedHeaders:["Content-Type","Authorization"],
}))


// Import the routes
import  healthCheckRouter from "./routes/healthcheck.routes.js"
import authRouter from "./routes/auth.routes.js"

app.use("/api/v1/healthcheck",healthCheckRouter) // for others we use get-->/nameonly
app.use("/api/v1/auth", authRouter)


app.get('/home', (req, res) => {
    res.send('Welcome to basecamp')
  })


  export default app;