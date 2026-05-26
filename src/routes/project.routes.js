import { Router } from "express";
import {
    createProject, getAllProjects, getProjectById,
    updateProject, deleteProject,
    addMember, removeMember,
} from "../controllers/project.controllers.js";
import { verifyJWT } from "../middleware/auth.middleware.js";

const router = Router();
router.use(verifyJWT);

// ─────────────────────────────────────────────────────────────────────────────
// SWAGGER DOCS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * @swagger
 * tags:
 *   name: Projects
 *   description: Project management with member access control and role assignment
 */

/**
 * @swagger
 * /api/v1/projects:
 *   get:
 *     summary: Get all projects — ones I created + ones I am a member of
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [active, on_hold, completed, cancelled]
 *         example: active
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by project name
 *         example: my app
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
 *     responses:
 *       200:
 *         description: Projects list with task counts
 *   post:
 *     summary: Create a new project
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 example: My Awesome App
 *               description:
 *                 type: string
 *                 example: A project to manage tasks for my development team
 *               status:
 *                 type: string
 *                 enum: [active, on_hold, completed, cancelled]
 *                 example: active
 *     responses:
 *       201:
 *         description: Project created. Creator auto-added as project_admin.
 *       400:
 *         description: Project name is required
 */

/**
 * @swagger
 * /api/v1/projects/{projectId}:
 *   get:
 *     summary: Get project by ID with all its tasks
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *         example: 6650f2a1b2c3d4e5f6a7b8c9
 *     responses:
 *       200:
 *         description: Project detail with members and tasks
 *       403:
 *         description: You are not a member of this project
 *       404:
 *         description: Project not found
 *   patch:
 *     summary: Update project — owner or project_admin only
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: projectId
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
 *               name:
 *                 type: string
 *                 example: Updated Project Name
 *               description:
 *                 type: string
 *                 example: Updated description
 *               status:
 *                 type: string
 *                 enum: [active, on_hold, completed, cancelled]
 *                 example: on_hold
 *     responses:
 *       200:
 *         description: Project updated
 *       403:
 *         description: Only project admin or owner can update
 *       404:
 *         description: Project not found
 *   delete:
 *     summary: Delete project — owner only. Tasks are unlinked but not deleted.
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *         example: 6650f2a1b2c3d4e5f6a7b8c9
 *     responses:
 *       200:
 *         description: Project deleted. Tasks preserved but unlinked.
 *       403:
 *         description: Only the owner or admin can delete
 *       404:
 *         description: Project not found
 */

/**
 * @swagger
 * /api/v1/projects/{projectId}/members:
 *   post:
 *     summary: Add a member to the project
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: projectId
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
 *               - userId
 *             properties:
 *               userId:
 *                 type: string
 *                 description: ObjectId of the user to add
 *                 example: 6650f2a1b2c3d4e5f6a7b8c9
 *               role:
 *                 type: string
 *                 enum: [member, project_admin]
 *                 example: member
 *     responses:
 *       200:
 *         description: Member added successfully
 *       409:
 *         description: User is already a member
 *       404:
 *         description: Project or user not found
 */

/**
 * @swagger
 * /api/v1/projects/{projectId}/members/{userId}:
 *   delete:
 *     summary: Remove a member from the project
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *         example: 6650f2a1b2c3d4e5f6a7b8c9
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: ObjectId of member to remove
 *         example: 6650f2a1b2c3d4e5f6a7b8c9
 *     responses:
 *       200:
 *         description: Member removed
 *       403:
 *         description: You cannot remove this member
 *       404:
 *         description: User is not a member of this project
 */

// ─────────────────────────────────────────────────────────────────────────────
// ROUTES
// ─────────────────────────────────────────────────────────────────────────────

router.route("/").get(getAllProjects).post(createProject);

router.route("/:projectId")
    .get(getProjectById)
    .patch(updateProject)
    .delete(deleteProject);

router.route("/:projectId/members").post(addMember);
router.route("/:projectId/members/:userId").delete(removeMember);

export default router;