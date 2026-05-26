import { Project } from "../models/project.models.js";
import { Task } from "../models/task.models.js";
import { User } from "../models/user.models.js";
import { ApiError } from "../utils/api-error.js";
import { ApiResponse } from "../utils/api-response.js";
import { asyncHandler } from "../utils/async-handler.js";
import { UserRoleEnum, ActivityActionEnum } from "../utils/constants.js";
import { logActivity } from "../utils/activity-logger.js";

const POPULATE_USER = "username email avatar";

// ─── Create Project ───────────────────────────────────────────────────────────
const createProject = asyncHandler(async (req, res) => {
    const { name, description, status } = req.body;

    if (!name?.trim()) throw new ApiError(400, "Project name is required");

    const project = await Project.create({
        name: name.trim(),
        description: description?.trim() || "",
        status: status || "active",
        createdBy: req.user._id,
        members: [{ user: req.user._id, role: UserRoleEnum.PROJECT_ADMIN }],
    });

    await logActivity(ActivityActionEnum.PROJECT_CREATED, "Project", project._id, req.user._id, { name: project.name });

    return res.status(201).json(
        new ApiResponse(201, { project }, "Project created successfully")
    );
});

// ─── Get All Projects (my projects) ──────────────────────────────────────────
const getAllProjects = asyncHandler(async (req, res) => {
    const { status, search, page = 1, limit = 10 } = req.query;

    const filter = {
        $or: [
            { createdBy: req.user._id },
            { "members.user": req.user._id },
        ],
    };

    if (status) filter.status = status;
    if (search) filter.name = { $regex: search, $options: "i" };

    const skip = (Number(page) - 1) * Number(limit);

    const [projects, total] = await Promise.all([
        Project.find(filter)
            .populate("createdBy", POPULATE_USER)
            .populate("members.user", POPULATE_USER)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(Number(limit)),
        Project.countDocuments(filter),
    ]);

    // Attach task counts to each project
    const projectIds = projects.map((p) => p._id);
    const taskCounts = await Task.aggregate([
        { $match: { project: { $in: projectIds } } },
        { $group: { _id: "$project", count: { $sum: 1 } } },
    ]);

    const countMap = {};
    taskCounts.forEach((t) => { countMap[t._id.toString()] = t.count; });

    const projectsWithCounts = projects.map((p) => ({
        ...p.toObject(),
        taskCount: countMap[p._id.toString()] || 0,
    }));

    return res.status(200).json(
        new ApiResponse(200, {
            projects: projectsWithCounts,
            pagination: { total, page: Number(page), totalPages: Math.ceil(total / Number(limit)) },
        }, "Projects fetched successfully")
    );
});

// ─── Get Project By ID (with its tasks) ──────────────────────────────────────
const getProjectById = asyncHandler(async (req, res) => {
    const { projectId } = req.params;

    const project = await Project.findById(projectId)
        .populate("createdBy", POPULATE_USER)
        .populate("members.user", POPULATE_USER);

    if (!project) throw new ApiError(404, "Project not found");

    const isMember = project.members.some(
        (m) => m.user._id.toString() === req.user._id.toString()
    );
    const isCreator = project.createdBy._id.toString() === req.user._id.toString();
    const isAdmin = req.user.role === UserRoleEnum.ADMIN;

    if (!isMember && !isCreator && !isAdmin) {
        throw new ApiError(403, "You are not a member of this project");
    }

    const tasks = await Task.find({ project: projectId })
        .populate("assignedTo", POPULATE_USER)
        .populate("createdBy", POPULATE_USER)
        .sort({ createdAt: -1 });

    return res.status(200).json(
        new ApiResponse(200, { project, tasks }, "Project fetched successfully")
    );
});

// ─── Update Project ───────────────────────────────────────────────────────────
const updateProject = asyncHandler(async (req, res) => {
    const { projectId } = req.params;
    const { name, description, status } = req.body;

    const project = await Project.findById(projectId);
    if (!project) throw new ApiError(404, "Project not found");

    const isAdmin = req.user.role === UserRoleEnum.ADMIN;
    const isCreator = project.createdBy.toString() === req.user._id.toString();
    const isProjectAdmin = project.members.some(
        (m) => m.user.toString() === req.user._id.toString() && m.role === UserRoleEnum.PROJECT_ADMIN
    );

    if (!isAdmin && !isCreator && !isProjectAdmin) {
        throw new ApiError(403, "Only project admin or owner can update");
    }

    if (name) project.name = name.trim();
    if (description !== undefined) project.description = description.trim();
    if (status) project.status = status;

    await project.save();
    await logActivity(ActivityActionEnum.PROJECT_UPDATED, "Project", project._id, req.user._id);

    return res.status(200).json(
        new ApiResponse(200, { project }, "Project updated successfully")
    );
});

// ─── Delete Project ───────────────────────────────────────────────────────────
const deleteProject = asyncHandler(async (req, res) => {
    const { projectId } = req.params;

    const project = await Project.findById(projectId);
    if (!project) throw new ApiError(404, "Project not found");

    const isAdmin = req.user.role === UserRoleEnum.ADMIN;
    const isCreator = project.createdBy.toString() === req.user._id.toString();
    if (!isAdmin && !isCreator) throw new ApiError(403, "Only the owner or admin can delete this project");

    // Cascade — unlink all tasks from this project (don't delete tasks)
    await Task.updateMany({ project: projectId }, { $set: { project: null } });
    await Project.findByIdAndDelete(projectId);

    await logActivity(ActivityActionEnum.PROJECT_DELETED, "Project", projectId, req.user._id, { name: project.name });

    return res.status(200).json(new ApiResponse(200, {}, "Project deleted successfully"));
});

// ─── Add Member ───────────────────────────────────────────────────────────────
const addMember = asyncHandler(async (req, res) => {
    const { projectId } = req.params;
    const { userId, role } = req.body;

    if (!userId) throw new ApiError(400, "userId is required");

    const [project, userToAdd] = await Promise.all([
        Project.findById(projectId),
        User.findById(userId),
    ]);

    if (!project) throw new ApiError(404, "Project not found");
    if (!userToAdd) throw new ApiError(404, "User not found");

    const isAdmin = req.user.role === UserRoleEnum.ADMIN;
    const isCreator = project.createdBy.toString() === req.user._id.toString();
    const isProjectAdmin = project.members.some(
        (m) => m.user.toString() === req.user._id.toString() && m.role === UserRoleEnum.PROJECT_ADMIN
    );

    if (!isAdmin && !isCreator && !isProjectAdmin) {
        throw new ApiError(403, "Only project admin can add members");
    }

    const alreadyMember = project.members.some(
        (m) => m.user.toString() === userId
    );
    if (alreadyMember) throw new ApiError(409, "User is already a member of this project");

    project.members.push({ user: userId, role: role || UserRoleEnum.MEMBER });
    await project.save();

    await logActivity(ActivityActionEnum.MEMBER_ADDED, "Project", projectId, req.user._id, { addedUser: userId });

    const updated = await Project.findById(projectId).populate("members.user", POPULATE_USER);

    return res.status(200).json(
        new ApiResponse(200, { project: updated }, "Member added successfully")
    );
});

// ─── Remove Member ────────────────────────────────────────────────────────────
const removeMember = asyncHandler(async (req, res) => {
    const { projectId, userId } = req.params;

    const project = await Project.findById(projectId);
    if (!project) throw new ApiError(404, "Project not found");

    const isAdmin = req.user.role === UserRoleEnum.ADMIN;
    const isCreator = project.createdBy.toString() === req.user._id.toString();
    const isSelf = req.user._id.toString() === userId;

    if (!isAdmin && !isCreator && !isSelf) {
        throw new ApiError(403, "You cannot remove this member");
    }

    const memberIndex = project.members.findIndex((m) => m.user.toString() === userId);
    if (memberIndex === -1) throw new ApiError(404, "User is not a member of this project");

    project.members.splice(memberIndex, 1);
    await project.save();

    await logActivity(ActivityActionEnum.MEMBER_REMOVED, "Project", projectId, req.user._id, { removedUser: userId });

    return res.status(200).json(new ApiResponse(200, {}, "Member removed successfully"));
});

export { createProject, getAllProjects, getProjectById, updateProject, deleteProject, addMember, removeMember };
