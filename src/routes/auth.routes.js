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

// ─────────────────────────────────────────────────────────────────────────────
// SWAGGER DOCS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: User authentication and account management
 */

/**
 * @swagger
 * /api/v1/auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - email
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *                 example: aliharoon
 *               email:
 *                 type: string
 *                 example: ali@test.com
 *               password:
 *                 type: string
 *                 example: test1234
 *               fullName:
 *                 type: string
 *                 example: Ali Haroon
 *               role:
 *                 type: string
 *                 enum: [member, admin, project_admin]
 *                 example: member
 *               adminSecret:
 *                 type: string
 *                 description: Required only when role is admin or project_admin
 *                 example: your_admin_secret_key
 *     responses:
 *       201:
 *         description: User registered. Verification email sent.
 *       409:
 *         description: User with email or username already exists
 *       422:
 *         description: Validation error
 */

/**
 * @swagger
 * /api/v1/auth/login:
 *   post:
 *     summary: Login with email or username
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 example: ali@test.com
 *               username:
 *                 type: string
 *                 example: aliharoon
 *               password:
 *                 type: string
 *                 example: test1234
 *     responses:
 *       200:
 *         description: Login successful — returns accessToken and refreshToken
 *       401:
 *         description: Invalid credentials
 *       404:
 *         description: User not found
 */

/**
 * @swagger
 * /api/v1/auth/verify-email/{verificationToken}:
 *   get:
 *     summary: Verify email address using token from email link
 *     tags: [Auth]
 *     parameters:
 *       - in: path
 *         name: verificationToken
 *         required: true
 *         schema:
 *           type: string
 *         description: Token from the verification email link
 *         example: a3f8b2c1d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0
 *     responses:
 *       200:
 *         description: Email verified successfully
 *       400:
 *         description: Token is invalid or expired
 */

/**
 * @swagger
 * /api/v1/auth/refresh-token:
 *   post:
 *     summary: Get a new access token using refresh token
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - refreshToken
 *             properties:
 *               refreshToken:
 *                 type: string
 *                 example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *     responses:
 *       200:
 *         description: New access token issued
 *       401:
 *         description: Invalid or expired refresh token
 */

/**
 * @swagger
 * /api/v1/auth/forgot-password:
 *   post:
 *     summary: Request a password reset email
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 example: ali@test.com
 *     responses:
 *       200:
 *         description: Password reset email sent
 *       404:
 *         description: User not found
 */

/**
 * @swagger
 * /api/v1/auth/reset-password/{resetToken}:
 *   post:
 *     summary: Reset password using token from email
 *     tags: [Auth]
 *     parameters:
 *       - in: path
 *         name: resetToken
 *         required: true
 *         schema:
 *           type: string
 *         example: a3f8b2c1d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - newPassword
 *             properties:
 *               newPassword:
 *                 type: string
 *                 example: mynewpassword123
 *     responses:
 *       200:
 *         description: Password reset successfully
 *       400:
 *         description: Token is invalid or expired
 */

/**
 * @swagger
 * /api/v1/auth/logout:
 *   post:
 *     summary: Logout current user
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Logged out successfully
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /api/v1/auth/current-user:
 *   get:
 *     summary: Get the currently logged in user
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Current user data
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /api/v1/auth/change-password:
 *   post:
 *     summary: Change password while logged in
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - oldPassword
 *               - newPassword
 *             properties:
 *               oldPassword:
 *                 type: string
 *                 example: test1234
 *               newPassword:
 *                 type: string
 *                 example: mynewpassword123
 *     responses:
 *       200:
 *         description: Password changed successfully
 *       400:
 *         description: Invalid old password
 */

/**
 * @swagger
 * /api/v1/auth/resend-email-verification:
 *   post:
 *     summary: Resend the email verification link
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Verification email sent
 *       409:
 *         description: Email is already verified
 */

/**
 * @swagger
 * /api/v1/auth/update-avatar:
 *   patch:
 *     summary: Upload or update profile avatar
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - avatar
 *             properties:
 *               avatar:
 *                 type: string
 *                 format: binary
 *                 description: Image file — JPEG, PNG or WebP, max 2MB
 *     responses:
 *       200:
 *         description: Avatar updated successfully
 *       400:
 *         description: No file provided or invalid file type
 */

/**
 * @swagger
 * /api/v1/auth/update-profile:
 *   patch:
 *     summary: Update fullName or username
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               fullName:
 *                 type: string
 *                 example: Ali Haroon Updated
 *               username:
 *                 type: string
 *                 example: aliharoon_new
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *       409:
 *         description: Username already taken
 */

// ─────────────────────────────────────────────────────────────────────────────
// ROUTES
// ─────────────────────────────────────────────────────────────────────────────

// Public
router.route("/register").post(authLimiter, userRegisterValidator(), validate, registerUser);
router.route("/login").post(authLimiter, userLoginValidator(), validate, login);
router.route("/refresh-token").post(refreshAccessToken);
router.route("/verify-email/:verificationToken").get(verifyEmail);
router.route("/forgot-password").post(authLimiter, userForgotPasswordValidator(), validate, forgotPasswordRequest);
router.route("/reset-password/:resetToken").post(userResetForgotPasswordValidator(), validate, resetForgotPassword);

// Protected
router.route("/logout").post(verifyJWT, logoutUser);
router.route("/current-user").get(verifyJWT, getCurrentUser);
router.route("/change-password").post(verifyJWT, userChangeCurrentPasswordValidator(), validate, changeCurrentPassword);
router.route("/resend-email-verification").post(verifyJWT, emailLimiter, resendEmailVerification);
router.route("/update-avatar").patch(verifyJWT, upload.single("avatar"), updateAvatar);
router.route("/update-profile").patch(verifyJWT, updateProfile);

export default router;