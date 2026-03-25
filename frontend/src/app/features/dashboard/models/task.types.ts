import { ApiResponse } from '../../auth/models/auth.types';

export type TaskStatus = 'todo' | 'in-progress' | 'done';
export type TaskPriority = 'low' | 'medium' | 'high';

export interface Task {
  _id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface TasksPayload {
  tasks: Task[];
  meta?: Record<string, unknown>;
}

export type TasksResponse = ApiResponse<TasksPayload>;
