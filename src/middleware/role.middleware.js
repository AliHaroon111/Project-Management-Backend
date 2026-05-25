import { ApiError } from "../utils/api-error.js";

/**
 * verifyRole(...roles)
 * Usage in routes: router.delete("/", verifyJWT, verifyRole("admin", "project_admin"), deleteTask)
 */
export const verifyRole = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            throw new ApiError(401, "Unauthorized request");
        }
        if (!roles.includes(req.user.role)) {
            throw new ApiError(
                403,
                `You do not have permission. Required role: ${roles.join(" or ")}`
            );
        }
        next();
    };
};
