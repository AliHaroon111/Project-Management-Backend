export const UserRoleEnum = {
    ADMIN: "admin",
    PROJECT_ADMIN: "project_admin",
    MEMBER: "member",
};
export const AvailableUserRole = Object.values(UserRoleEnum);

export const TaskStatusEnum = {
    TODO: "todo",
    IN_PROGRESS: "In_progress",
    DONE: "done",
};
export const AvailableTaskStatus = Object.values(TaskStatusEnum);

// NEW — priority levels
export const TaskPriorityEnum = {
    LOW: "low",
    MEDIUM: "medium",
    HIGH: "high",
    URGENT: "urgent",
};
export const AvailableTaskPriority = Object.values(TaskPriorityEnum);

// NEW — activity log actions
export const ActivityActionEnum = {
    // Auth
    USER_REGISTERED: "user_registered",
    USER_LOGIN: "user_login",
    USER_LOGOUT: "user_logout",
    PASSWORD_CHANGED: "password_changed",
    PASSWORD_RESET: "password_reset",
    EMAIL_VERIFIED: "email_verified",
    PROFILE_UPDATED: "profile_updated",
    // Projects
    PROJECT_CREATED: "project_created",
    PROJECT_UPDATED: "project_updated",
    PROJECT_DELETED: "project_deleted",
    MEMBER_ADDED: "member_added",
    MEMBER_REMOVED: "member_removed",
    // Tasks
    TASK_CREATED: "task_created",
    TASK_UPDATED: "task_updated",
    TASK_DELETED: "task_deleted",
    TASK_ASSIGNED: "task_assigned",
    // Comments
    COMMENT_ADDED: "comment_added",
    COMMENT_DELETED: "comment_deleted",
};
export const AvailableActivityActions = Object.values(ActivityActionEnum);

export const ProjectStatusEnum = {
    ACTIVE: "active",
    ON_HOLD: "on_hold",
    COMPLETED: "completed",
    CANCELLED: "cancelled",
};
export const AvailableProjectStatus = Object.values(ProjectStatusEnum);
