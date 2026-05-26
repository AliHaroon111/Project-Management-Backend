import { Task } from "../models/task.models.js";
import { Comment } from "../models/comment.models.js";
import { ApiError } from "../utils/api-error.js";
import { ApiResponse } from "../utils/api-response.js";
import { asyncHandler } from "../utils/async-handler.js";
import { UserRoleEnum, ActivityActionEnum } from "../utils/constants.js";
import { logActivity } from "../utils/activity-logger.js";

const POPULATE_USER = "username email avatar";

// ─── Create Task ──────────────────────────────────────────────────────────────
const createTask = asyncHandler(async (req, res) => {
    const { title, description, assignedTo, status, priority, dueDate, project } = req.body;

    if (!title?.trim()) throw new ApiError(400, "Task title is required");

    const task = await Task.create({
        title: title.trim(),
        description: description?.trim() || "",
        status: status || "todo",
        priority: priority || "medium",
        dueDate: dueDate ? new Date(dueDate) : null,
        assignedTo: assignedTo || null,
        project: project || null,
        createdBy: req.user._id,
    });

    const populated = await Task.findById(task._id)
        .populate("createdBy", POPULATE_USER)
        .populate("assignedTo", POPULATE_USER)
        .populate("project", "name status");

    await logActivity(
        ActivityActionEnum.TASK_CREATED,
        "Task", task._id, req.user._id,
        { title: task.title, priority: task.priority }
    );

    return res.status(201).json(
        new ApiResponse(201, { task: populated }, "Task created successfully")
    );
});

// ─── Get All Tasks (search + filter + pagination + sort) ──────────────────────
const getAllTasks = asyncHandler(async (req, res) => {
    const {
        status, priority, assignedTo, project,
        search, overdue,
        page = 1, limit = 10,
        sortBy = "createdAt", order = "desc",
    } = req.query;

    const filter = {};
    if (status)     filter.status = status;
    if (priority)   filter.priority = priority;
    if (assignedTo) filter.assignedTo = assignedTo;
    if (project)    filter.project = project;

    // Full-text search on title + description
    if (search) {
        filter.$or = [
            { title: { $regex: search, $options: "i" } },
            { description: { $regex: search, $options: "i" } },
        ];
    }

    // Overdue filter — tasks whose dueDate has passed and aren't done
    if (overdue === "true") {
        filter.dueDate = { $lt: new Date() };
        filter.status = { $ne: "done" };
    }

    const skip = (Number(page) - 1) * Number(limit);
    const sortOrder = order === "asc" ? 1 : -1;

    const [tasks, total] = await Promise.all([
        Task.find(filter)
            .populate("createdBy", POPULATE_USER)
            .populate("assignedTo", POPULATE_USER)
            .populate("project", "name status")
            .sort({ [sortBy]: sortOrder })
            .skip(skip)
            .limit(Number(limit)),
        Task.countDocuments(filter),
    ]);

    return res.status(200).json(
        new ApiResponse(200, {
            tasks,
            pagination: {
                total,
                page: Number(page),
                limit: Number(limit),
                totalPages: Math.ceil(total / Number(limit)),
                hasNextPage: Number(page) < Math.ceil(total / Number(limit)),
            },
        }, "Tasks fetched successfully")
    );
});

// ─── Get Task Stats (dashboard) ───────────────────────────────────────────────
const getTaskStats = asyncHandler(async (req, res) => {
    const [statusStats, priorityStats, myTasks, overdueTasks, recentTasks] = await Promise.all([
        Task.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]),
        Task.aggregate([{ $group: { _id: "$priority", count: { $sum: 1 } } }]),
        Task.countDocuments({ createdBy: req.user._id }),
        Task.countDocuments({ dueDate: { $lt: new Date() }, status: { $ne: "done" } }),
        Task.find().sort({ createdAt: -1 }).limit(5).populate("createdBy", "username"),
    ]);

    const byStatus = {};
    statusStats.forEach((s) => { byStatus[s._id] = s.count; });

    const byPriority = {};
    priorityStats.forEach((p) => { byPriority[p._id] = p.count; });

    const totalTasks = await Task.countDocuments();

    return res.status(200).json(
        new ApiResponse(200, {
            stats: {
                total: totalTasks,
                byStatus,
                byPriority,
                myTasks,
                overdueTasks,
                recentTasks,
            },
        }, "Stats fetched successfully")
    );
});

// ─── Get Task By ID ───────────────────────────────────────────────────────────
const getTaskById = asyncHandler(async (req, res) => {
    const { taskId } = req.params;

    const task = await Task.findById(taskId)
        .populate("createdBy", POPULATE_USER)
        .populate("assignedTo", POPULATE_USER)
        .populate("project", "name status");

    if (!task) throw new ApiError(404, "Task not found");

    // Also fetch comments count
    const commentsCount = await Comment.countDocuments({ task: taskId });

    return res.status(200).json(
        new ApiResponse(200, { task, commentsCount }, "Task fetched successfully")
    );
});

// ─── Update Task ──────────────────────────────────────────────────────────────
const updateTask = asyncHandler(async (req, res) => {
    const { taskId } = req.params;
    const { title, description, status, priority, dueDate, assignedTo } = req.body;

    const task = await Task.findById(taskId);
    if (!task) throw new ApiError(404, "Task not found");

    const isAdmin = [UserRoleEnum.ADMIN, UserRoleEnum.PROJECT_ADMIN].includes(req.user.role);
    const isCreator = task.createdBy.toString() === req.user._id.toString();
    if (!isAdmin && !isCreator) throw new ApiError(403, "You do not have permission to update this task");

    const oldStatus = task.status;
    const oldPriority = task.priority;

    if (title !== undefined)       task.title = title.trim();
    if (description !== undefined) task.description = description.trim();
    if (status !== undefined)      task.status = status;
    if (priority !== undefined)    task.priority = priority;
    if (dueDate !== undefined)     task.dueDate = dueDate ? new Date(dueDate) : null;
    if (assignedTo !== undefined)  task.assignedTo = assignedTo || null;

    await task.save();

    await logActivity(
        ActivityActionEnum.TASK_UPDATED,
        "Task", task._id, req.user._id,
        { oldStatus, newStatus: task.status, oldPriority, newPriority: task.priority }
    );

    const updated = await Task.findById(taskId)
        .populate("createdBy", POPULATE_USER)
        .populate("assignedTo", POPULATE_USER)
        .populate("project", "name status");

    return res.status(200).json(
        new ApiResponse(200, { task: updated }, "Task updated successfully")
    );
});

// ─── Delete Task ──────────────────────────────────────────────────────────────
const deleteTask = asyncHandler(async (req, res) => {
    const { taskId } = req.params;

    const task = await Task.findById(taskId);
    if (!task) throw new ApiError(404, "Task not found");

    const isAdmin = [UserRoleEnum.ADMIN, UserRoleEnum.PROJECT_ADMIN].includes(req.user.role);
    const isCreator = task.createdBy.toString() === req.user._id.toString();
    if (!isAdmin && !isCreator) throw new ApiError(403, "You do not have permission to delete this task");

    await Promise.all([
        Task.findByIdAndDelete(taskId),
        Comment.deleteMany({ task: taskId }),  // cascade delete comments
    ]);

    await logActivity(ActivityActionEnum.TASK_DELETED, "Task", taskId, req.user._id, { title: task.title });

    return res.status(200).json(new ApiResponse(200, {}, "Task and its comments deleted successfully"));
});

// ─── Add Comment ──────────────────────────────────────────────────────────────
const addComment = asyncHandler(async (req, res) => {
    const { taskId } = req.params;
    const { content } = req.body;

    if (!content?.trim()) throw new ApiError(400, "Comment content is required");

    const task = await Task.findById(taskId);
    if (!task) throw new ApiError(404, "Task not found");

    const comment = await Comment.create({
        content: content.trim(),
        task: taskId,
        author: req.user._id,
    });

    const populated = await Comment.findById(comment._id).populate("author", POPULATE_USER);

    await logActivity(ActivityActionEnum.COMMENT_ADDED, "Comment", comment._id, req.user._id, { taskId });

    return res.status(201).json(
        new ApiResponse(201, { comment: populated }, "Comment added successfully")
    );
});

// ─── Get Comments ─────────────────────────────────────────────────────────────
const getComments = asyncHandler(async (req, res) => {
    const { taskId } = req.params;
    const { page = 1, limit = 20 } = req.query;

    const task = await Task.findById(taskId);
    if (!task) throw new ApiError(404, "Task not found");

    const skip = (Number(page) - 1) * Number(limit);
    const [comments, total] = await Promise.all([
        Comment.find({ task: taskId })
            .populate("author", POPULATE_USER)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(Number(limit)),
        Comment.countDocuments({ task: taskId }),
    ]);

    return res.status(200).json(
        new ApiResponse(200, {
            comments,
            pagination: { total, page: Number(page), totalPages: Math.ceil(total / Number(limit)) },
        }, "Comments fetched successfully")
    );
});

// ─── Delete Comment ───────────────────────────────────────────────────────────
const deleteComment = asyncHandler(async (req, res) => {
    const { taskId, commentId } = req.params;

    const comment = await Comment.findById(commentId);
    if (!comment) throw new ApiError(404, "Comment not found");
    if (comment.task.toString() !== taskId) throw new ApiError(400, "Comment does not belong to this task");

    const isAdmin = [UserRoleEnum.ADMIN, UserRoleEnum.PROJECT_ADMIN].includes(req.user.role);
    const isAuthor = comment.author.toString() === req.user._id.toString();
    if (!isAdmin && !isAuthor) throw new ApiError(403, "You can only delete your own comments");

    await Comment.findByIdAndDelete(commentId);
    await logActivity(ActivityActionEnum.COMMENT_DELETED, "Comment", commentId, req.user._id, { taskId });

    return res.status(200).json(new ApiResponse(200, {}, "Comment deleted successfully"));
});

export {
    createTask, getAllTasks, getTaskById, updateTask, deleteTask,
    getTaskStats,
    addComment, getComments, deleteComment,
};
