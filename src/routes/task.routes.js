import { Router } from "express";
import {
    createTask, getAllTasks, getTaskById, updateTask, deleteTask,
    getTaskStats,
    addComment, getComments, deleteComment,
} from "../controllers/task.controllers.js";
import { verifyJWT } from "../middleware/auth.middleware.js";
import { verifyRole } from "../middleware/role.middleware.js";

const router = Router();
router.use(verifyJWT);

// ─────────────────────────────────────────────────────────────────────────────
// SWAGGER DOCS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * @swagger
 * tags:
 *   name: Tasks
 *   description: Task management with priority, due dates, comments, and search
 */

/**
 * @swagger
 * /api/v1/tasks/stats:
 *   get:
 *     summary: Get task statistics — totals by status, priority, overdue count
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Stats fetched successfully
 *         content:
 *           application/json:
 *             example:
 *               statusCode: 200
 *               data:
 *                 stats:
 *                   total: 12
 *                   byStatus:
 *                     todo: 5
 *                     In_progress: 4
 *                     done: 3
 *                   byPriority:
 *                     urgent: 2
 *                     high: 4
 *                     medium: 5
 *                     low: 1
 *                   myTasks: 6
 *                   overdueTasks: 2
 */

/**
 * @swagger
 * /api/v1/tasks:
 *   get:
 *     summary: Get all tasks with search, filter, sort, and pagination
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search across title and description
 *         example: login bug
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [todo, In_progress, done]
 *         example: todo
 *       - in: query
 *         name: priority
 *         schema:
 *           type: string
 *           enum: [low, medium, high, urgent]
 *         example: urgent
 *       - in: query
 *         name: overdue
 *         schema:
 *           type: boolean
 *         description: true = only tasks past their due date
 *         example: true
 *       - in: query
 *         name: assignedTo
 *         schema:
 *           type: string
 *         description: Filter by assigned user ObjectId
 *         example: 6650f2a1b2c3d4e5f6a7b8c9
 *       - in: query
 *         name: project
 *         schema:
 *           type: string
 *         description: Filter by project ObjectId
 *         example: 6650f2a1b2c3d4e5f6a7b8c9
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         example: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         example: 10
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *         example: dueDate
 *       - in: query
 *         name: order
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *         example: asc
 *     responses:
 *       200:
 *         description: Tasks fetched with pagination info
 *   post:
 *     summary: Create a new task
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *             properties:
 *               title:
 *                 type: string
 *                 example: Fix the login bug
 *               description:
 *                 type: string
 *                 example: Users cannot login using username — only email works
 *               status:
 *                 type: string
 *                 enum: [todo, In_progress, done]
 *                 example: todo
 *               priority:
 *                 type: string
 *                 enum: [low, medium, high, urgent]
 *                 example: urgent
 *               dueDate:
 *                 type: string
 *                 format: date-time
 *                 example: "2026-06-07T23:59:00.000Z"
 *               assignedTo:
 *                 type: string
 *                 description: User ObjectId to assign this task to
 *                 example: 6650f2a1b2c3d4e5f6a7b8c9
 *               project:
 *                 type: string
 *                 description: Project ObjectId this task belongs to
 *                 example: 6650f2a1b2c3d4e5f6a7b8c9
 *     responses:
 *       201:
 *         description: Task created successfully
 *       400:
 *         description: Title is required
 */

/**
 * @swagger
 * /api/v1/tasks/{taskId}:
 *   get:
 *     summary: Get a single task by ID
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: taskId
 *         required: true
 *         schema:
 *           type: string
 *         example: 6650f2a1b2c3d4e5f6a7b8c9
 *     responses:
 *       200:
 *         description: Task with comment count
 *       404:
 *         description: Task not found
 *   patch:
 *     summary: Update a task (creator or admin only)
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: taskId
 *         required: true
 *         schema:
 *           type: string
 *         example: 6650f2a1b2c3d4e5f6a7b8c9
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 example: Updated task title
 *               description:
 *                 type: string
 *                 example: Updated description
 *               status:
 *                 type: string
 *                 enum: [todo, In_progress, done]
 *                 example: In_progress
 *               priority:
 *                 type: string
 *                 enum: [low, medium, high, urgent]
 *                 example: high
 *               dueDate:
 *                 type: string
 *                 format: date-time
 *                 example: "2026-06-10T23:59:00.000Z"
 *               assignedTo:
 *                 type: string
 *                 example: 6650f2a1b2c3d4e5f6a7b8c9
 *     responses:
 *       200:
 *         description: Task updated successfully
 *       403:
 *         description: You do not have permission
 *       404:
 *         description: Task not found
 *   delete:
 *     summary: Delete a task — admin or project_admin only
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: taskId
 *         required: true
 *         schema:
 *           type: string
 *         example: 6650f2a1b2c3d4e5f6a7b8c9
 *     responses:
 *       200:
 *         description: Task and its comments deleted
 *       403:
 *         description: You do not have permission — must be admin or project_admin
 *       404:
 *         description: Task not found
 */

/**
 * @swagger
 * /api/v1/tasks/{taskId}/comments:
 *   post:
 *     summary: Add a comment to a task
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: taskId
 *         required: true
 *         schema:
 *           type: string
 *         example: 6650f2a1b2c3d4e5f6a7b8c9
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - content
 *             properties:
 *               content:
 *                 type: string
 *                 example: Working on this right now, will update by EOD
 *     responses:
 *       201:
 *         description: Comment added successfully
 *       404:
 *         description: Task not found
 *   get:
 *     summary: Get all comments for a task
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: taskId
 *         required: true
 *         schema:
 *           type: string
 *         example: 6650f2a1b2c3d4e5f6a7b8c9
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
 *         description: Comments list with pagination
 */

/**
 * @swagger
 * /api/v1/tasks/{taskId}/comments/{commentId}:
 *   delete:
 *     summary: Delete a comment — own comment or admin only
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: taskId
 *         required: true
 *         schema:
 *           type: string
 *         example: 6650f2a1b2c3d4e5f6a7b8c9
 *       - in: path
 *         name: commentId
 *         required: true
 *         schema:
 *           type: string
 *         example: 6650f2a1b2c3d4e5f6a7b8c9
 *     responses:
 *       200:
 *         description: Comment deleted
 *       403:
 *         description: You can only delete your own comments
 *       404:
 *         description: Comment not found
 */

// ─────────────────────────────────────────────────────────────────────────────
// ROUTES
// ─────────────────────────────────────────────────────────────────────────────

// Stats must be BEFORE /:taskId to avoid route conflict
router.route("/stats").get(getTaskStats);

router.route("/").get(getAllTasks).post(createTask);

router.route("/:taskId")
    .get(getTaskById)
    .patch(updateTask)
    .delete(verifyRole("admin", "project_admin"), deleteTask);

router.route("/:taskId/comments").post(addComment).get(getComments);
router.route("/:taskId/comments/:commentId").delete(deleteComment);

export default router;