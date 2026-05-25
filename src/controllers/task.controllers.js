import { Task } from "../models/task.models.js";
import { ApiError } from "../utils/api-error.js";
import { ApiResponse } from "../utils/api-response.js";
import { asyncHandler } from "../utils/async-handler.js";
import { UserRoleEnum } from "../utils/constants.js";

// ─── Create Task ──────────────────────────────────────────────────────────────
const createTask = asyncHandler(async (req, res) => {
    const { title, description, assignedTo, status } = req.body;

    if (!title?.trim()) throw new ApiError(400, "Task title is required");

    const task = await Task.create({
        title,
        description: description || "",
        status: status || "todo",
        assignedTo: assignedTo || null,
        createdBy: req.user._id,
    });

    const populatedTask = await Task.findById(task._id)
        .populate("createdBy", "username email")
        .populate("assignedTo", "username email");

    return res.status(201).json(
        new ApiResponse(201, { task: populatedTask }, "Task created successfully")
    );
});

// ─── Get All Tasks ────────────────────────────────────────────────────────────
const getAllTasks = asyncHandler(async (req, res) => {
    const { status, assignedTo, page = 1, limit = 10 } = req.query;

    const filter = {};
    if (status) filter.status = status;
    if (assignedTo) filter.assignedTo = assignedTo;

    const skip = (Number(page) - 1) * Number(limit);

    const [tasks, total] = await Promise.all([
        Task.find(filter)
            .populate("createdBy", "username email avatar")
            .populate("assignedTo", "username email avatar")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(Number(limit)),
        Task.countDocuments(filter),
    ]);

    return res.status(200).json(
        new ApiResponse(
            200,
            {
                tasks,
                pagination: {
                    total,
                    page: Number(page),
                    limit: Number(limit),
                    totalPages: Math.ceil(total / Number(limit)),
                },
            },
            "Tasks fetched successfully"
        )
    );
});

// ─── Get Task By ID ───────────────────────────────────────────────────────────
const getTaskById = asyncHandler(async (req, res) => {
    const { taskId } = req.params;

    const task = await Task.findById(taskId)
        .populate("createdBy", "username email avatar")
        .populate("assignedTo", "username email avatar");

    if (!task) throw new ApiError(404, "Task not found");

    return res.status(200).json(
        new ApiResponse(200, { task }, "Task fetched successfully")
    );
});

// ─── Update Task ──────────────────────────────────────────────────────────────
const updateTask = asyncHandler(async (req, res) => {
    const { taskId } = req.params;
    const { title, description, status, assignedTo } = req.body;

    const task = await Task.findById(taskId);
    if (!task) throw new ApiError(404, "Task not found");

    // Only creator or admin can update
    const isAdmin = [UserRoleEnum.ADMIN, UserRoleEnum.PROJECT_ADMIN].includes(req.user.role);
    const isCreator = task.createdBy.toString() === req.user._id.toString();

    if (!isAdmin && !isCreator) {
        throw new ApiError(403, "You do not have permission to update this task");
    }

    if (title !== undefined) task.title = title;
    if (description !== undefined) task.description = description;
    if (status !== undefined) task.status = status;
    if (assignedTo !== undefined) task.assignedTo = assignedTo;

    await task.save();

    const updatedTask = await Task.findById(taskId)
        .populate("createdBy", "username email avatar")
        .populate("assignedTo", "username email avatar");

    return res.status(200).json(
        new ApiResponse(200, { task: updatedTask }, "Task updated successfully")
    );
});

// ─── Delete Task ──────────────────────────────────────────────────────────────
const deleteTask = asyncHandler(async (req, res) => {
    const { taskId } = req.params;

    const task = await Task.findById(taskId);
    if (!task) throw new ApiError(404, "Task not found");

    const isAdmin = [UserRoleEnum.ADMIN, UserRoleEnum.PROJECT_ADMIN].includes(req.user.role);
    const isCreator = task.createdBy.toString() === req.user._id.toString();

    if (!isAdmin && !isCreator) {
        throw new ApiError(403, "You do not have permission to delete this task");
    }

    await Task.findByIdAndDelete(taskId);

    return res.status(200).json(
        new ApiResponse(200, {}, "Task deleted successfully")
    );
});

export { createTask, getAllTasks, getTaskById, updateTask, deleteTask };
