import { Router } from "express";
import { getActivityFeed, getEntityActivity } from "../controllers/activity.controllers.js";
import { verifyJWT } from "../middleware/auth.middleware.js";

const router = Router();
router.use(verifyJWT);

/**
 * @swagger
 * tags:
 *   name: Activity
 *   description: Audit log of all actions in the system
 */

/**
 * @swagger
 * /api/v1/activity:
 *   get:
 *     summary: Get activity feed (admins see all, members see own)
 *     tags: [Activity]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: entity
 *         schema: { type: string }
 *         description: Filter by entity type (Task, Project, User, Comment)
 *       - in: query
 *         name: action
 *         schema: { type: string }
 */
router.route("/").get(getActivityFeed);
router.route("/entity/:entityId").get(getEntityActivity);

export default router;
