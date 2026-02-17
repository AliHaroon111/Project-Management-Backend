import { Router } from "express";
import { login, logoutUser, registerUser } from "../controllers/auth.controllers.js";

// bring validation routes
import { validate } from "../middleware/validator.middleware.js";
import { userLoginValidator, userRegisterValidator } from "../validators/index.js";
import {verifyJWT} from "../middleware/auth.middleware.js"

const router = Router()

// router.route("/register").post(registerUser)  //simple route
router.route("/register").post(userRegisterValidator(),validate,registerUser) //with validation   ---------> validate ----> It's not a function itJust a midddleware
router.route("/login").post(userLoginValidator(),validate,login) // here the validate is the common middleware

//Secure Routes
router.route("/logout").post(verifyJWT,logoutUser) //in this case post/get are same
//we only logout the user who have logged in So we need Middlewar
export default router