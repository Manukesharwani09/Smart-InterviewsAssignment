import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CreateTaskPayload, TaskResponse, TasksResponse } from '../models/task.types';

@Injectable({ providedIn: 'root' })
export class TaskService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = '/api/v1/tasks';

  getTasks(): Observable<TasksResponse> {
    return this.http.get<TasksResponse>(this.baseUrl, {
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
}
