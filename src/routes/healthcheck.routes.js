import { Router } from "express";
import { healthCheck } from "../controllers/healthcheck.controllers.js";


const router = Router()

router.route("/").get(healthCheck)
// router.route("/instagra").get(healthCheck) //for example

export default router


/** // this is the initial boilerplate code for route
 import { Router } from "express";


const router = Router()


export default router
 */