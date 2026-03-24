import { Router } from "express";
import {
  createTask,
  deleteTask,
  getTaskAnalytics,
  getTaskById,
  getTasks,
  updateTask,
} from "../controllers/task.controller.js";
import { verfifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.use(verfifyJWT);

router.route("/").post(createTask).get(getTasks);

router.get("/analytics/summary", getTaskAnalytics);

router.route("/:taskId").get(getTaskById).put(updateTask).delete(deleteTask);

export default router;
