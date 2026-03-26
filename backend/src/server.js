import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
dotenv.config();
import connectDB from "./config/db.js";
import authRoutes from "./routes/user.route.js";
import taskRoutes from "./routes/task.route.js";
import {
  notFoundHandler,
  globalErrorHandler,
} from "./middlewares/error.middleware.js";

const app = express();

//config & middlewares
app.use(
  cors({
    origin: function (origin, callback) {
      callback(null, origin || true);
    },
    credentials: true,
  }),
);
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());

//connect db
connectDB();

//routes
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/tasks", taskRoutes);
app.get("/", (req, res) => {
  res.json({ message: "Task Manager API is running!" });
});

//handlers
app.use(notFoundHandler);
app.use(globalErrorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
