import mongoose, { Schema } from "mongoose";
import { AvailableTaskStatus, TaskStatusEnum, AvailableTaskPriority, TaskPriorityEnum } from "../utils/constants.js";

const taskSchema = new Schema(
    {
        title: {
            type: String,
            required: [true, "Task title is required"],
            trim: true,
        },
        description: {
            type: String,
            trim: true,
            default: "",
        },
        status: {
            type: String,
            enum: AvailableTaskStatus,
            default: TaskStatusEnum.TODO,
        },
        // NEW — priority
        priority: {
            type: String,
            enum: AvailableTaskPriority,
            default: TaskPriorityEnum.MEDIUM,
        },
        // NEW — due date
        dueDate: {
            type: Date,
            default: null,
        },
        assignedTo: {
            type: Schema.Types.ObjectId,
            ref: "User",
            default: null,
        },
        // NEW — belongs to a project
        project: {
            type: Schema.Types.ObjectId,
            ref: "Project",
            default: null,
        },
        createdBy: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
    },
    { timestamps: true }
);

// Index for fast filtering
taskSchema.index({ status: 1, priority: 1, dueDate: 1 });
taskSchema.index({ project: 1 });
taskSchema.index({ assignedTo: 1 });

export const Task = mongoose.model("Task", taskSchema);
