import mongoose, { Schema } from "mongoose";
import { AvailableActivityActions } from "../utils/constants.js";

const activitySchema = new Schema(
    {
        action: {
            type: String,
            enum: AvailableActivityActions,
            required: true,
        },
        entity: {
            type: String,   // "Task" | "Project" | "User" | "Comment"
            required: true,
        },
        entityId: {
            type: Schema.Types.ObjectId,
            required: true,
        },
        performedBy: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        // Extra context — e.g. { oldStatus: "todo", newStatus: "done" }
        metadata: {
            type: Schema.Types.Mixed,
            default: {},
        },
    },
    { timestamps: true }
);

activitySchema.index({ performedBy: 1, createdAt: -1 });
activitySchema.index({ entityId: 1 });
activitySchema.index({ createdAt: -1 });

export const ActivityLog = mongoose.model("ActivityLog", activitySchema);
