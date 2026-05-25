import { upload } from "../middleware/multer.middleware.js";
import rateLimit from "express-rate-limit";
import { updateAvatar } from "../controllers/auth.controllers.js";
import { Router } from "express";
import { resendEmailVerification, changeCurrentPassword, getCurrentUser, resetForgotPassword, forgotPasswordRequest, refreshAccessToken, verifyEmail, login, logoutUser, registerUser } from "../controllers/auth.controllers.js";

// bring validation routes
import { validate } from "../middleware/validator.middleware.js";
import { userResetForgotPasswordValidator, userChangeCurrentPasswordValidator, userForgotPasswordValidator, userLoginValidator, userRegisterValidator } from "../validators/index.js";
import {verifyJWT} from "../middleware/auth.middleware.js"

// Rate Limiter
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    message: { message: "Too many attempts, please try again after 15 minutes" },
    standardHeaders: true,
    legacyHeaders: false,
});

const emailLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    max: 3,
    message: { message: "Too many email requests, please try again after 1 hour" },
    standardHeaders: true,
    legacyHeaders: false,
});

const router = Router()

// router.route("/register").post(registerUser)  //simple route
router.route("/register").post(authLimiter,userRegisterValidator(),validate,registerUser) //with validation   ---------> validate ----> It's not a function itJust a midddleware
router.route("/login").post(authLimiter,userLoginValidator(),validate,login) // here the validate is the common middleware
router.route("/verify-email/:verificationToken").get(verifyEmail)
router.route("/refresh-token").post(refreshAccessToken)
router.route("/forgot-password").post(authLimiter,userForgotPasswordValidator(), validate, forgotPasswordRequest)
router.route("/reset-password/:resetToken").post(userResetForgotPasswordValidator(),validate , resetForgotPassword)


//Secure Routes (will require jwt)
router.route("/logout").post(verifyJWT,logoutUser) //in this case post/get are same
//we only logout the user who have logged in So we need Middlewar

router.route("/current-user").post(verifyJWT, getCurrentUser)
router.route("/change-password").post(verifyJWT,userChangeCurrentPasswordValidator(), validate ,changeCurrentPassword)
router.route("/resend-emil-verification").post(verifyJWT,emailLimiter,resendEmailVerification)
router.route("/update-avatar").patch(verifyJWT, upload.single("avatar"), updateAvatar);

export default router