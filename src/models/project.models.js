import mongoose, { Schema } from "mongoose";
import { AvailableProjectStatus, ProjectStatusEnum, AvailableUserRole, UserRoleEnum } from "../utils/constants.js";

const projectMemberSchema = new Schema(
    {
        user: { type: Schema.Types.ObjectId, ref: "User", required: true },
        role: { type: String, enum: AvailableUserRole, default: UserRoleEnum.MEMBER },
    },
    { _id: false }
);

const projectSchema = new Schema(
    {
        name: {
            type: String,
            required: [true, "Project name is required"],
            trim: true,
            maxlength: [100, "Project name cannot exceed 100 characters"],
        },
        description: {
            type: String,
            trim: true,
            default: "",
            maxlength: [500, "Description cannot exceed 500 characters"],
        },
        status: {
            type: String,
            enum: AvailableProjectStatus,
            default: ProjectStatusEnum.ACTIVE,
        },
        createdBy: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        members: {
            type: [projectMemberSchema],
            default: [],
        },
    },
    { timestamps: true }
);

projectSchema.index({ createdBy: 1 });
projectSchema.index({ "members.user": 1 });

export const Project = mongoose.model("Project", projectSchema);
