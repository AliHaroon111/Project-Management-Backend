# Project Management Backend API

> A robust, production-grade RESTful API built with **Node.js**, **Express**, and **MongoDB** to manage collaborative projects, tasks, and user workflows.
>
> ✨ This project was finished and enhanced using **GitHub Copilot** for the [GitHub Copilot Finish-Up-A-Thon Challenge](https://dev.to/challenges/github-2026-05-21).

---

## 🚀 Features

| Feature | Description |
|---|---|
| **JWT Authentication** | Access + refresh token rotation with secure httpOnly cookies |
| **Email Verification** | Account verification flow with expiring tokens |
| **Password Reset** | Secure forgot/reset password via email |
| **Role-Based Access Control** | `admin`, `project_admin`, `member` roles enforced at route level |
| **Task Management** | Full CRUD with status tracking (`todo`, `In_progress`, `done`) |
| **Avatar Upload** | Profile picture upload via multipart/form-data (multer) |
| **Rate Limiting** | Brute-force protection on auth endpoints |
| **Security Headers** | Helmet.js for production-grade HTTP headers |
| **Request Logging** | Morgan for HTTP request logging (dev + production modes) |
| **API Documentation** | Live Swagger UI at `/api/v1/docs` |
| **Input Validation** | express-validator on all routes |
| **Global Error Handler** | Consistent error responses, no stack trace leaks |

---

## 📁 Project Structure

```
src/
├── controllers/
│   ├── auth.controllers.js       # Register, login, logout, verify, reset
│   ├── task.controllers.js       # Task CRUD
│   └── healthcheck.controllers.js
├── middleware/
│   ├── auth.middleware.js        # JWT verification
│   ├── role.middleware.js        # RBAC — verifyRole()
│   ├── multer.middleware.js      # File upload
│   └── validator.middleware.js   # express-validator runner
├── models/
│   ├── user.models.js            # User schema with roles
│   └── task.models.js            # Task schema
├── routes/
│   ├── auth.routes.js            # /api/v1/auth/*
│   ├── task.routes.js            # /api/v1/tasks/*
│   └── healthcheck.routes.js     # /api/v1/healthcheck
├── utils/
│   ├── api-error.js
│   ├── api-response.js
│   ├── async-handler.js
│   ├── constants.js              # Enums for roles and task status
│   └── mail.js                   # Mailgen + Nodemailer
├── validators/
│   └── index.js                  # All validator chains
├── swagger/
│   └── swagger.js                # OpenAPI 3.0 spec config
├── db/
│   └── index.js                  # MongoDB connection
├── app.js                        # Express app setup
└── index.js                      # Entry point
```

---

## 🛠️ Getting Started

### Prerequisites

- Node.js v18+
- MongoDB (local or Atlas)
- A [Mailtrap](https://mailtrap.io) account (free) for email testing

### Installation

```bash
# 1. Clone the repo
git clone https://github.com/YOUR_USERNAME/ProjectManagement.git
cd ProjectManagement

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env
# Fill in your values in .env

# 4. Start the development server
npm run dev
```

The server starts at `http://localhost:3000`
API Docs available at `http://localhost:3000/api/v1/docs`

---

## 🔑 Environment Variables

Copy `.env.example` to `.env` and fill in all values. See `.env.example` for descriptions of each variable.

---

## 📡 API Endpoints

### Auth — `/api/v1/auth`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/register` | — | Register new user |
| POST | `/login` | — | Login with email or username |
| POST | `/logout` | ✅ JWT | Logout user |
| GET | `/current-user` | ✅ JWT | Get logged-in user |
| GET | `/verify-email/:token` | — | Verify email address |
| POST | `/resend-email-verification` | ✅ JWT | Resend verification email |
| POST | `/refresh-token` | — | Rotate access token |
| POST | `/forgot-password` | — | Request password reset email |
| POST | `/reset-password/:token` | — | Reset password with token |
| POST | `/change-password` | ✅ JWT | Change current password |
| PATCH | `/update-avatar` | ✅ JWT | Upload profile avatar |

### Tasks — `/api/v1/tasks`

| Method | Endpoint | Auth | Role | Description |
|---|---|---|---|---|
| GET | `/` | ✅ JWT | Any | Get all tasks (paginated) |
| POST | `/` | ✅ JWT | Any | Create a task |
| GET | `/:taskId` | ✅ JWT | Any | Get task by ID |
| PATCH | `/:taskId` | ✅ JWT | Creator/Admin | Update task |
| DELETE | `/:taskId` | ✅ JWT | Admin/Project Admin | Delete task |

### Health — `/api/v1/healthcheck`

| Method | Endpoint | Description |
|---|---|---|
| GET | `/` | Server health check |

---

## 🔒 Role-Based Access Control

Three roles are available: `admin`, `project_admin`, `member` (default).

```js
// Usage in routes
router.delete("/:taskId", verifyJWT, verifyRole("admin", "project_admin"), deleteTask);
```

---

## 🤖 How GitHub Copilot Helped

This project was originally started as a learning exercise and left incomplete. GitHub Copilot helped me:

1. **Fix 8 critical bugs** — including a silent `sha-256` vs `sha256` hash mismatch that broke password reset entirely, a missing import for `forgotPasswordMailgenContent`, a malformed Mailgen email template, an invalid HTTP status code `489`, and a route typo (`resend-emil`).

2. **Build the Tasks feature** — Copilot generated the Task model, controllers, and routes based on the `TaskStatusEnum` constants I had already defined, completing a feature I had scaffolded but never built.

3. **Add production middleware** — Helmet, Morgan, express-rate-limit, and the global error handler were added with Copilot guiding each step.

4. **Implement RBAC** — The `verifyRole` middleware was built with Copilot using the `UserRoleEnum` constants already in the codebase.

5. **Write Swagger docs** — Copilot generated the swagger-jsdoc configuration and JSDoc route annotations.

---

## 📦 Tech Stack

- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB + Mongoose
- **Authentication:** JWT (jsonwebtoken) + bcrypt
- **Email:** Nodemailer + Mailgen + Mailtrap
- **Validation:** express-validator
- **Security:** Helmet, express-rate-limit
- **File Upload:** Multer
- **Documentation:** Swagger UI + swagger-jsdoc
- **Logging:** Morgan

---

## 📄 License

MIT
