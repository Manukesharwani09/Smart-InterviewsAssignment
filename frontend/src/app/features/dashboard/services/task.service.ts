import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiResponse } from '../../auth/models/auth.types';
import { CreateTaskPayload, TaskResponse, TasksResponse } from '../models/task.types';

export interface TaskQueryParams {
  status?: string;
  priority?: string;
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: string;
}

export interface TaskAnalyticsSummary {
  totals: {
    total: number;
    completed: number;
    pending: number;
    completionPercentage: number;
  };
  breakdown: {
    status: Record<string, number>;
    priority: Record<string, number>;
  };
}

@Injectable({ providedIn: 'root' })
export class TaskService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = '/api/v1/tasks';

  getTasks(params: TaskQueryParams = {}): Observable<TasksResponse> {
    let httpParams = new HttpParams();

    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        httpParams = httpParams.set(key, String(value));
      }
    });

    return this.http.get<TasksResponse>(this.baseUrl, {
      params: httpParams,
      withCredentials: true,
    });
  }

  createTask(payload: CreateTaskPayload): Observable<TaskResponse> {
    return this.http.post<TaskResponse>(this.baseUrl, payload, {
      withCredentials: true,
    });
  }

  updateTask(taskId: string, payload: CreateTaskPayload): Observable<TaskResponse> {
    return this.http.put<TaskResponse>(`${this.baseUrl}/${taskId}`, payload, {
      withCredentials: true,
    });
  }

  deleteTask(taskId: string): Observable<ApiResponse<null>> {
    return this.http.delete<ApiResponse<null>>(`${this.baseUrl}/${taskId}`, {
      withCredentials: true,
    });
  }

  getAnalytics(): Observable<ApiResponse<TaskAnalyticsSummary>> {
    return this.http.get<ApiResponse<TaskAnalyticsSummary>>(`${this.baseUrl}/analytics/summary`, {
      withCredentials: true,
    });
  }
}
