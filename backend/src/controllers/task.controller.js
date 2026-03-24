import Task from "../models/Task.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const createTask = asyncHandler(async (req, res) => {
  const { title, description, status, priority, dueDate } = req.body;

  if (!title?.trim()) {
    throw new ApiError(400, "Task title is required");
  }

  const task = await Task.create({
    title: title.trim(),
    description: description?.trim() || "",
    status,
    priority,
    dueDate,
    user: req.user._id,
  });

  return res
    .status(201)
    .json(new ApiResponse(201, "Task created successfully", task));
});

const getTasks = asyncHandler(async (req, res) => {
  const tasks = await Task.find({ user: req.user._id }).sort({ createdAt: -1 });
  return res
    .status(200)
    .json(new ApiResponse(200, "Tasks fetched successfully", tasks));
});

const getTaskById = asyncHandler(async (req, res) => {
  const { taskId } = req.params;
  const task = await Task.findOne({ _id: taskId, user: req.user._id });

  if (!task) {
    throw new ApiError(404, "Task not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, "Task fetched successfully", task));
});

const updateTask = asyncHandler(async (req, res) => {
  const { taskId } = req.params;
  const updates = req.body;

  const task = await Task.findOneAndUpdate(
    { _id: taskId, user: req.user._id },
    { $set: updates },
    { new: true, runValidators: true },
  );

  if (!task) {
    throw new ApiError(404, "Task not found or unauthorized");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, "Task updated successfully", task));
});

const deleteTask = asyncHandler(async (req, res) => {
  const { taskId } = req.params;

  const task = await Task.findOneAndDelete({ _id: taskId, user: req.user._id });

  if (!task) {
    throw new ApiError(404, "Task not found or unauthorized");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, "Task deleted successfully"));
});

export { createTask, getTasks, getTaskById, updateTask, deleteTask };
