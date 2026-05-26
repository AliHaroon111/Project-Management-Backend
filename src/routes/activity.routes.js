import { Router } from "express";
import { getActivityFeed, getEntityActivity } from "../controllers/activity.controllers.js";
import { verifyJWT } from "../middleware/auth.middleware.js";

const router = Router();
router.use(verifyJWT);

// ─────────────────────────────────────────────────────────────────────────────
// SWAGGER DOCS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * @swagger
 * tags:
 *   name: Activity
 *   description: Audit log — every action in the system is recorded here
 */

/**
 * @swagger
 * /api/v1/activity:
 *   get:
 *     summary: Get activity feed — admins see all, members see only their own
 *     tags: [Activity]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: entity
 *         schema:
 *           type: string
 *           enum: [Task, Project, User, Comment]
 *         description: Filter by entity type
 *         example: Task
 *       - in: query
 *         name: action
 *         schema:
 *           type: string
 *         description: Filter by action type
 *         example: task_created
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         example: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         example: 20
 *     responses:
 *       200:
 *         description: Activity feed with pagination
 *         content:
 *           application/json:
 *             example:
 *               statusCode: 200
 *               data:
 *                 logs:
 *                   - action: task_created
 *                     entity: Task
 *                     entityId: 6650f2a1b2c3d4e5f6a7b8c9
 *                     performedBy:
 *                       username: aliharoon
 *                       email: ali@test.com
 *                     metadata:
 *                       title: Fix login bug
 *                       priority: urgent
 *                     createdAt: "2026-05-26T10:00:00.000Z"
 *                 pagination:
 *                   total: 45
 *                   page: 1
 *                   totalPages: 3
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /api/v1/activity/entity/{entityId}:
 *   get:
 *     summary: Get full activity history for a specific task or project
 *     tags: [Activity]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: entityId
 *         required: true
 *         schema:
 *           type: string
 *         description: ObjectId of the task or project
 *         example: 6650f2a1b2c3d4e5f6a7b8c9
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         example: 10
 *     responses:
 *       200:
 *         description: Activity history for the entity
 *       401:
 *         description: Unauthorized
 */

// ─────────────────────────────────────────────────────────────────────────────
// ROUTES
// ─────────────────────────────────────────────────────────────────────────────

router.route("/").get(getActivityFeed);
router.route("/entity/:entityId").get(getEntityActivity);

export default router;