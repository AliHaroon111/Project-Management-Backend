import { ActivityLog } from "../models/activity.models.js";
import { ApiResponse } from "../utils/api-response.js";
import { asyncHandler } from "../utils/async-handler.js";
import { UserRoleEnum } from "../utils/constants.js";

// ─── Get Activity Feed ────────────────────────────────────────────────────────
const getActivityFeed = asyncHandler(async (req, res) => {
    const { page = 1, limit = 20, entity, action } = req.query;

    const filter = {};
    const isAdmin = req.user.role === UserRoleEnum.ADMIN;

    // Non-admins only see their own activity
    if (!isAdmin) filter.performedBy = req.user._id;
    if (entity) filter.entity = entity;
    if (action) filter.action = action;

    const skip = (Number(page) - 1) * Number(limit);

    const [logs, total] = await Promise.all([
        ActivityLog.find(filter)
            .populate("performedBy", "username email avatar")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(Number(limit)),
        ActivityLog.countDocuments(filter),
    ]);

    return res.status(200).json(
        new ApiResponse(200, {
            logs,
            pagination: { total, page: Number(page), totalPages: Math.ceil(total / Number(limit)) },
        }, "Activity feed fetched successfully")
    );
});

// ─── Get Activity For Specific Entity ─────────────────────────────────────────
const getEntityActivity = asyncHandler(async (req, res) => {
    const { entityId } = req.params;
    const { limit = 10 } = req.query;

    const logs = await ActivityLog.find({ entityId })
        .populate("performedBy", "username email avatar")
        .sort({ createdAt: -1 })
        .limit(Number(limit));

    return res.status(200).json(
        new ApiResponse(200, { logs }, "Entity activity fetched")
    );
});

export { getActivityFeed, getEntityActivity };
