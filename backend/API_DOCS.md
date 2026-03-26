# Task Manager API Documentation (v1)

This document describes the REST API endpoints, request/response formats, and data models for the Task Manager backend. Use this as a reference for frontend integration or for generating API clients.

---

## Authentication & User Endpoints

### POST `/api/v1/auth/signup`

- **Description:** Register a new user.
- **Request Body:**

```json
{
  "name": "Jordan Alvarez",
  "username": "jordan",
  "email": "jordan@team.com",
  "password": "StrongPass123"
}
```

- **Response:**

```json
{
  "statusCode": 201,
  "message": "User registered successfully",
  "data": {
    "user": {
      "_id": "...",
      "username": "jordan",
      "name": "Jordan Alvarez",
      "email": "jordan@team.com",
      "role": "user",
      "createdAt": "...",
      "updatedAt": "..."
    },
    "accessToken": "..."
  }
}
```

---

### POST `/api/v1/auth/login`

- **Description:** Log in with email or username and password.
- **Request Body:**

```json
{
  "email": "jordan@team.com",
  "password": "StrongPass123"
}
```

- **Response:**

```json
{
  "statusCode": 200,
  "message": "Logged in successfully",
  "data": {
    "user": {
      /* see above */
    },
    "accessToken": "..."
  }
}
```

---

### POST `/api/v1/auth/logout`

- **Description:** Log out the current user (requires JWT).
- **Response:**

```json
{
  "statusCode": 200,
  "message": "Logged out successfully"
}
```

---

### POST `/api/v1/auth/refresh-token`

- **Description:** Get a new access token using a refresh token.
- **Request Body:**

```json
{
  "refreshToken": "..."
}
```

- **Response:**

```json
{
  "statusCode": 200,
  "message": "Token refreshed",
  "data": {
    "accessToken": "..."
  }
}
```

---

### POST `/api/v1/auth/change-password`

- **Description:** Change the current user's password (requires JWT).
- **Request Body:**

```json
{
  "oldPassword": "StrongPass123",
  "newPassword": "NewStrongPass456"
}
```

- **Response:**

```json
{
  "statusCode": 200,
  "message": "Password updated successfully. Please log in again."
}
```

---

### GET `/api/v1/auth/current-user`

- **Description:** Get the current user's profile (requires JWT).
- **Response:**

```json
{
  "statusCode": 200,
  "message": "Success",
  "data": {
    "user": {
      /* see above */
    }
  }
}
```

---

## Task Endpoints

All endpoints below require a valid JWT access token.

### POST `/api/v1/tasks`

- **Description:** Create a new task.
- **Request Body:**

```json
{
  "title": "Finish API docs",
  "description": "Write detailed API documentation for the project.",
  "status": "todo",
  "priority": "high",
  "dueDate": "2024-03-30T23:59:59.000Z"
}
```

- **Response:**

```json
{
  "statusCode": 201,
  "message": "Task created successfully",
  "data": {
    "_id": "...",
    "title": "Finish API docs",
    "description": "Write detailed API documentation for the project.",
    "status": "todo",
    "priority": "high",
    "dueDate": "2024-03-30T23:59:59.000Z",
    "user": "...",
    "createdAt": "...",
    "updatedAt": "..."
  }
}
```

---

### GET `/api/v1/tasks`

- **Description:** List tasks for the current user (supports filtering, search, pagination).
- **Query Params:** `status`, `priority`, `search`, `sortBy`, `sortOrder`, `page`, `limit`
- **Response:**

```json
{
  "statusCode": 200,
  "message": "Tasks fetched successfully",
  "data": {
    "tasks": [
      /* array of Task objects */
    ],
    "meta": {
      "total": 12,
      "page": 1,
      "pageSize": 5,
      "totalPages": 3
    }
  }
}
```

---

### GET `/api/v1/tasks/analytics/summary`

- **Description:** Get analytics for the current user's tasks.
- **Response:**

```json
{
  "statusCode": 200,
  "message": "Task analytics fetched",
  "data": {
    "totals": {
      "total": 12,
      "completed": 5,
      "pending": 7,
      "completionPercentage": 41.67
    },
    "breakdown": {
      "status": {
        "todo": 4,
        "in-progress": 3,
        "done": 5
      },
      "priority": {
        "low": 2,
        "medium": 7,
        "high": 3
      }
    }
  }
}
```

---

### GET `/api/v1/tasks/:taskId`

- **Description:** Get a single task by ID.
- **Response:**

```json
{
  "statusCode": 200,
  "message": "Task fetched successfully",
  "data": {
    /* Task object */
  }
}
```

---

### PUT `/api/v1/tasks/:taskId`

- **Description:** Update a task by ID.
- **Request Body:** Partial Task fields
- **Response:**

```json
{
  "statusCode": 200,
  "message": "Task updated successfully",
  "data": {
    /* Task object */
  }
}
```

---

### DELETE `/api/v1/tasks/:taskId`

- **Description:** Delete a task by ID.
- **Response:**

```json
{
  "statusCode": 200,
  "message": "Task deleted successfully"
}
```

---

## Data Models

### User

```json
{
  "_id": "string",
  "username": "string",
  "name": "string",
  "email": "string",
  "role": "user" | "admin",
  "createdAt": "ISO date string",
  "updatedAt": "ISO date string"
}
```

### Task

```json
{
  "_id": "string",
  "title": "string",
  "description": "string",
  "status": "todo" | "in-progress" | "done",
  "priority": "low" | "medium" | "high",
  "dueDate": "ISO date string | null",
  "user": "string (User _id)",
  "createdAt": "ISO date string",
  "updatedAt": "ISO date string"
}
```

---

## Error Response

```json
{
  "statusCode": 400,
  "message": "Error message here"
}
```

---

**Notes:**

- All endpoints return JSON.
- All dates are ISO 8601 strings.
- All IDs are MongoDB ObjectIds (strings).
- All protected endpoints require `Authorization: Bearer <accessToken>` header.

---

For further details, see the backend source code or contact the API maintainer.
