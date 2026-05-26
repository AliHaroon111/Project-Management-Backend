// ─────────────────────────────────────────────────────────────────────────────
// ADD these two lines to your existing auth.routes.js
// ─────────────────────────────────────────────────────────────────────────────

// 1. Add updateProfile to your import from auth.controllers.js:
//    import { ..., updateProfile } from "../controllers/auth.controllers.js";

// 2. Add this route (before export default router):
//    router.route("/update-profile").patch(verifyJWT, updateProfile);

// ─────────────────────────────────────────────────────────────────────────────
// FULL auth.routes.js for reference — replace your file with this:
// ─────────────────────────────────────────────────────────────────────────────

import { Router } from "express";
import {
    registerUser, login, logoutUser, getCurrentUser,
    verifyEmail, resendEmailVerification, refreshAccessToken,
    forgotPasswordRequest, resetForgotPassword, changeCurrentPassword,
    updateAvatar, updateProfile,
} from "../controllers/auth.controllers.js";
import { validate } from "../middleware/validator.middleware.js";
import {
    userRegisterValidator, userLoginValidator,
    userForgotPasswordValidator, userResetForgotPasswordValidator,
    userChangeCurrentPasswordValidator,
} from "../validators/index.js";
import { verifyJWT } from "../middleware/auth.middleware.js";
import { upload } from "../middleware/multer.middleware.js";
import rateLimit from "express-rate-limit";

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, max: 10,
    message: { message: "Too many attempts, please try again after 15 minutes" },
    standardHeaders: true, legacyHeaders: false,
});

const emailLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, max: 3,
    message: { message: "Too many email requests, please try again after 1 hour" },
    standardHeaders: true, legacyHeaders: false,
});

const router = Router();

// ─── Public Routes ────────────────────────────────────────────────────────────
router.route("/register").post(authLimiter, userRegisterValidator(), validate, registerUser);
router.route("/login").post(authLimiter, userLoginValidator(), validate, login);
router.route("/refresh-token").post(refreshAccessToken);
router.route("/verify-email/:verificationToken").get(verifyEmail);
router.route("/forgot-password").post(authLimiter, userForgotPasswordValidator(), validate, forgotPasswordRequest);
router.route("/reset-password/:resetToken").post(userResetForgotPasswordValidator(), validate, resetForgotPassword);

// ─── Protected Routes ─────────────────────────────────────────────────────────
router.route("/logout").post(verifyJWT, logoutUser);
router.route("/current-user").get(verifyJWT, getCurrentUser);
router.route("/change-password").post(verifyJWT, userChangeCurrentPasswordValidator(), validate, changeCurrentPassword);
router.route("/resend-email-verification").post(verifyJWT, emailLimiter, resendEmailVerification);
router.route("/update-avatar").patch(verifyJWT, upload.single("avatar"), updateAvatar);
router.route("/update-profile").patch(verifyJWT, updateProfile);  // NEW

export default router;
