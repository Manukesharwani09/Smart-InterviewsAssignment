import mongoose from 'mongoose';

const taskSchema = new mongoose.Schema(
  {
    // ── Core Fields ──────────────────────────────────────────────────────────
    title: {
      type: String,
      required: [true, 'Task title is required'],
      trim: true,
      minlength: [3, 'Title must be at least 3 characters'],
      maxlength: [100, 'Title cannot exceed 100 characters'],
    },

    description: {
      type: String,
      trim: true,
      maxlength: [1000, 'Description cannot exceed 1000 characters'],
      default: '',
    },

    // ── Status ───────────────────────────────────────────────────────────────
    status: {
      type: String,
      enum: {
        values: ['todo', 'in-progress', 'done'],
        message: 'Status must be todo, in-progress, or done',
      },
      default: 'todo',
    },

    // ── Priority ─────────────────────────────────────────────────────────────
    priority: {
      type: String,
      enum: {
        values: ['low', 'medium', 'high'],
        message: 'Priority must be low, medium, or high',
      },
      default: 'medium',
    },

    // ── Due Date ─────────────────────────────────────────────────────────────
    dueDate: {
      type: Date,
      default: null,
    },

    // ── Ownership — links every task to the user who created it ─────────────
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',            // References the User model
      required: [true, 'Task must belong to a user'],
    },
  },
  {
    timestamps: true,         // Auto adds createdAt and updatedAt
  }
);

// ─── Indexes ──────────────────────────────────────────────────────────────────
// Compound index: speeds up queries like "get all tasks for user X with status Y"
taskSchema.index({ user: 1, status: 1 });
taskSchema.index({ user: 1, priority: 1 });
taskSchema.index({ user: 1, dueDate: 1 });

// Text index: enables partial title search (req: Filtering & Search)
taskSchema.index({ title: 'text' });

const Task = mongoose.model('Task', taskSchema);

export default Task;
