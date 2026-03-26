# Task Manager App

## About the Project

This is a simple Task Management web app where you can create and manage your daily tasks. You can track your progress, see some basic analytics, and keep everything organized in one place.

- Create, update, and delete tasks
- Track what’s done and what’s left
- See stats like total/completed/pending tasks

## Live Link

Frontend: [https://browser-oftgnupny-manukesharwani09s-projects.vercel.app](https://browser-oftgnupny-manukesharwani09s-projects.vercel.app)  
Backend API: [https://tasktracker-63ez.onrender.com/](https://tasktracker-63ez.onrender.com/)

## Features

- User signup & login
- Create, update, delete tasks
- Mark task status (todo / in-progress / done)
- Set priority (low / medium / high)
- Search and filter tasks
- Pagination for task lists
- Analytics dashboard (total, completed, pending)
- Responsive UI (with dark theme)

## Tech Stack

- **Frontend:** Angular, Tailwind CSS
- **Backend:** Node.js, Express
- **Database:** MongoDB

## Setup Instructions

### Backend

1. Open terminal and go to the backend folder:
   ```
   cd backend
   ```
2. Install dependencies:
   ```
   npm install
   ```
3. Create a `.env` file in the backend folder and add:
   ```
   MONGO_URI=your_mongodb_connection_string
   PORT=5000
   ```
4. Start the backend server:
   ```
   npm run dev
   ```

### Frontend

1. Open a new terminal and go to the frontend folder:
   ```
   cd frontend
   ```
2. Install dependencies:
   ```
   npm install
   ```
3. Start the frontend app:
   ```
   ng serve
   ```

## API Endpoints (Overview)

### Auth Routes

- `POST /api/v1/auth/signup` — Register a new user
- `POST /api/v1/auth/login` — Login with email/username & password
- `POST /api/v1/auth/logout` — Logout current user
- `POST /api/v1/auth/refresh-token` — Get new access token using refresh token
- `POST /api/v1/auth/change-password` — Change password (requires login)
- `GET /api/v1/auth/current-user` — Get current user's profile

### Task Routes

- `POST /api/v1/tasks` — Create a new task
- `GET /api/v1/tasks` — List tasks (supports filtering, search, pagination)
- `GET /api/v1/tasks/:taskId` — Get a single task by ID
- `PUT /api/v1/tasks/:taskId` — Update a task by ID
- `DELETE /api/v1/tasks/:taskId` — Delete a task by ID

### Analytics Route

- `GET /api/v1/tasks/analytics/summary` — Get analytics for your tasks (total, completed, pending, breakdown by status/priority)

All protected endpoints require authentication via JWT cookies.

### .env Variables (Backend)

You need to set these in your backend `.env` file:

- `PORT` — Port for backend server (e.g. 5000)
- `MONGO_URI` — MongoDB connection string
- `CORS_ORIGIN` — Allowed frontend origin (e.g. http://localhost:4200)
- `ACCESS_TOKEN_SECRET` — Secret for JWT access tokens
- `ACCESS_TOKEN_EXPIRY` — Access token expiry (e.g. 1d)
- `REFRESH_TOKEN_SECRET` — Secret for JWT refresh tokens
- `REFRESH_TOKEN_EXPIRY` — Refresh token expiry (e.g. 10d)
- `CLOUDINARY_API_KEY` — (Optional) For image uploads
- `CLOUDINARY_API_SECRET` — (Optional) For image uploads
- `CLOUDINARY_CLOUD_NAME` — (Optional) For image uploads

## Design Decisions

- **Angular for Frontend:**
  - I picked Angular because it helps keep the frontend code organized and makes routing and state management easier.
  - Tailwind CSS was used for quick and modern UI styling.

- **Node.js & Express for Backend:**
  - Express is simple and lets you build APIs fast.
  - I used async/await everywhere to keep code readable.

- **MongoDB for Database:**
  - MongoDB is flexible,can add new fields to tasks/users without breaking things.
  - It’s easy to use with Mongoose in Node.js.

- **Authentication:**
  - Used JWT tokens stored in cookies for secure login and session management.
  - Cookies are HTTP-only for better security.

- **API Design:**
  - RESTful endpoints for all main features.
  - Backend handles filtering, searching, and pagination so the frontend stays simple.

## Future Improvements

- Add team collaboration (assign tasks to others)
- Better analytics with charts
- Add notifications for deadlines

## MongoDB Indexing

This project uses several MongoDB indexes to improve query performance and support efficient filtering, searching, and analytics:

### Task Collection Indexes

- **Compound Indexes:**
  - `{ user: 1, status: 1 }` — Speeds up queries that filter tasks by user and status (e.g., for dashboards or status breakdowns).
  - `{ user: 1, priority: 1 }` — Optimizes queries filtering by user and priority (e.g., for analytics or filtering high-priority tasks).
  - `{ user: 1, dueDate: 1 }` — Helps with queries that filter or sort tasks by due date for a specific user (e.g., upcoming deadlines).
- **Text Index:**
  - `{ title: "text" }` — Enables full-text search on the task title (e.g., searching tasks by keywords).

### User Collection Indexes

- **Unique Indexes:**
  - `username` — Ensures each username is unique and allows fast lookups by username.
  - `email` — Ensures each email is unique and allows fast lookups by email.
- **Single Field Index:**
  - `username` — Also indexed for efficient user authentication and lookup.
