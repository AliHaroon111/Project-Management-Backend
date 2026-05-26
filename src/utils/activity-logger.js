import { ActivityLog } from "../models/activity.models.js";

/**
 * logActivity — call this after any significant action
 * @param {string} action  — from ActivityActionEnum
 * @param {string} entity  — "Task" | "Project" | "User" | "Comment"
 * @param {ObjectId} entityId
 * @param {ObjectId} userId — req.user._id
 * @param {object} metadata — optional extra context
 */
export const logActivity = async (action, entity, entityId, userId, metadata = {}) => {
    try {
        await ActivityLog.create({ action, entity, entityId, performedBy: userId, metadata });
    } catch (err) {
        // Never let logging crash the main request
        console.error("Activity log failed silently:", err.message);
    }
};
