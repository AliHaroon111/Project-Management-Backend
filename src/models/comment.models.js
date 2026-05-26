import mongoose, { Schema } from "mongoose";

const commentSchema = new Schema(
    {
        content: {
            type: String,
            required: [true, "Comment content is required"],
            trim: true,
            maxlength: [1000, "Comment cannot exceed 1000 characters"],
        },
        task: {
            type: Schema.Types.ObjectId,
            ref: "Task",
            required: true,
        },
        author: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
    },
    { timestamps: true }
);

commentSchema.index({ task: 1, createdAt: -1 });

export const Comment = mongoose.model("Comment", commentSchema);
