import swaggerJsdoc from "swagger-jsdoc";

const options = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "Project Management API",
            version: "1.0.0",
            description:
                "A production-grade RESTful API for managing projects and tasks with full JWT authentication, role-based access control, and email verification. Built with Node.js, Express, and MongoDB.",
            contact: {
                name: "API Support",
                email: "support@taskmanager.com",
            },
        },
        servers: [
            {
                url: "http://localhost:3000",
                description: "Development server",
            },
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: "http",
                    scheme: "bearer",
                    bearerFormat: "JWT",
                },
                cookieAuth: {
                    type: "apiKey",
                    in: "cookie",
                    name: "accessToken",
                },
            },
        },
        tags: [
            { name: "Health", description: "Server health check" },
            { name: "Auth", description: "Authentication & user management" },
            { name: "Tasks", description: "Task CRUD operations" },
        ],
    },
    apis: ["./src/routes/*.js"],
};

export const swaggerSpec = swaggerJsdoc(options);
