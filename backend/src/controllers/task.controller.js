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
  const {
    status,
    priority,
    search,
    sortBy = "dueDate",
    sortOrder = "asc",
    page = 1,
    limit = 10,
  } = req.query;

  const filters = { user: req.user._id };
  if (status) {
    filters.status = status;
  }
  if (priority) {
    filters.priority = priority;
  }
  if (search) {
    filters.title = { $regex: search, $options: "i" };
  }

  const sortFieldMap = {
    duedate: "dueDate",
    priority: "priority",
    createdat: "createdAt",
  };

  const normalizedSort = sortFieldMap[sortBy?.toLowerCase()] || "dueDate";
  const sortDirection = sortOrder === "desc" ? -1 : 1;
  const sortOptions = { [normalizedSort]: sortDirection };

  const pageNumber = Math.max(parseInt(page, 10) || 1, 1);
  const pageSize = Math.min(Math.max(parseInt(limit, 10) || 10, 1), 50);
  const skip = (pageNumber - 1) * pageSize;

  const [tasks, total] = await Promise.all([
    Task.find(filters).sort(sortOptions).skip(skip).limit(pageSize),
    Task.countDocuments(filters),
  ]);

  return res.status(200).json(
    new ApiResponse(200, "Tasks fetched successfully", {
      tasks,
      meta: {
        total,
        page: pageNumber,
        pageSize,
        totalPages: Math.ceil(total / pageSize) || 1,
      },
    }),
  );
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

const getTaskAnalytics = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const [totalTasks, completedTasks, statusBreakdown, priorityBreakdown] =
    await Promise.all([
      Task.countDocuments({ user: userId }),
      Task.countDocuments({ user: userId, status: "done" }),
      Task.aggregate([
        { $match: { user: userId } },
        { $group: { _id: "$status", count: { $sum: 1 } } },
      ]),
      Task.aggregate([
        { $match: { user: userId } },
        { $group: { _id: "$priority", count: { $sum: 1 } } },
      ]),
    ]);

  const pendingTasks = totalTasks - completedTasks;
  const completionPercentage = totalTasks
    ? Number(((completedTasks / totalTasks) * 100).toFixed(2))
    : 0;

  const statusCounts = statusBreakdown.reduce((acc, curr) => {
    acc[curr._id] = curr.count;
    return acc;
  }, {});

  const priorityCounts = priorityBreakdown.reduce((acc, curr) => {
    acc[curr._id] = curr.count;
    return acc;
  }, {});

  return res.status(200).json(
    new ApiResponse(200, "Task analytics fetched", {
      totals: {
        total: totalTasks,
        completed: completedTasks,
        pending: pendingTasks,
        completionPercentage,
      },
      breakdown: {
        status: {
          todo: statusCounts.todo || 0,
          "in-progress": statusCounts["in-progress"] || 0,
          done: statusCounts.done || 0,
        },
        priority: {
          low: priorityCounts.low || 0,
          medium: priorityCounts.medium || 0,
          high: priorityCounts.high || 0,
        },
      },
    }),
  );
});

export {
  createTask,
  getTasks,
  getTaskById,
  updateTask,
  deleteTask,
  getTaskAnalytics,
};
