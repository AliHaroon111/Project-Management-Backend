import { Router } from "express";
import {
    createProject, getAllProjects, getProjectById,
    updateProject, deleteProject,
    addMember, removeMember,
} from "../controllers/project.controllers.js";
import { verifyJWT } from "../middleware/auth.middleware.js";

const router = Router();
router.use(verifyJWT);

/**
 * @swagger
 * tags:
 *   name: Projects
 *   description: Project management with member access control
 */

/**
 * @swagger
 * /api/v1/projects:
 *   get:
 *     summary: Get all projects (mine + where I'm a member)
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *   post:
 *     summary: Create a new project
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 */
router.route("/").get(getAllProjects).post(createProject);

/**
 * @swagger
 * /api/v1/projects/{projectId}:
 *   get:
 *     summary: Get project by ID with its tasks
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 */
router.route("/:projectId")
    .get(getProjectById)
    .patch(updateProject)
    .delete(deleteProject);

router.route("/:projectId/members").post(addMember);
router.route("/:projectId/members/:userId").delete(removeMember);

export default router;
