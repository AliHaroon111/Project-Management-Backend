import { Router } from "express";
import {
    createTask, getAllTasks, getTaskById, updateTask, deleteTask,
    getTaskStats,
    addComment, getComments, deleteComment,
} from "../controllers/task.controllers.js";
import { verifyJWT } from "../middleware/auth.middleware.js";
import { verifyRole } from "../middleware/role.middleware.js";

const router = Router();
router.use(verifyJWT); // all task routes need JWT

/**
 * @swagger
 * tags:
 *   name: Tasks
 *   description: Task management with comments, priority, due dates
 */

// ─── Stats (must be before /:taskId to avoid conflict) ───────────────────────
/**
 * @swagger
 * /api/v1/tasks/stats:
 *   get:
 *     summary: Get task statistics dashboard
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 */
router.route("/stats").get(getTaskStats);

// ─── Task CRUD ────────────────────────────────────────────────────────────────
/**
 * @swagger
 * /api/v1/tasks:
 *   get:
 *     summary: Get all tasks with search, filter, pagination
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *         description: Search in title and description
 *       - in: query
 *         name: status
 *         schema: { type: string, enum: [todo, In_progress, done] }
 *       - in: query
 *         name: priority
 *         schema: { type: string, enum: [low, medium, high, urgent] }
 *       - in: query
 *         name: overdue
 *         schema: { type: boolean }
 *       - in: query
 *         name: page
 *         schema: { type: integer }
 *       - in: query
 *         name: limit
 *         schema: { type: integer }
 *       - in: query
 *         name: sortBy
 *         schema: { type: string }
 *       - in: query
 *         name: order
 *         schema: { type: string, enum: [asc, desc] }
 */
router.route("/").get(getAllTasks).post(createTask);

router.route("/:taskId")
    .get(getTaskById)
    .patch(updateTask)
    .delete(verifyRole("admin", "project_admin"), deleteTask);

// ─── Comments ─────────────────────────────────────────────────────────────────
/**
 * @swagger
 * /api/v1/tasks/{taskId}/comments:
 *   post:
 *     summary: Add a comment to a task
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 */
router.route("/:taskId/comments").post(addComment).get(getComments);
router.route("/:taskId/comments/:commentId").delete(deleteComment);

export default router;
