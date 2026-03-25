import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { TasksResponse } from '../models/task.types';

@Injectable({ providedIn: 'root' })
export class TaskService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = '/api/v1/tasks';

  getTasks(): Observable<TasksResponse> {
    console.log('Fetching tasks from API...', this.baseUrl);
    const res= this.http.get<TasksResponse>(this.baseUrl, {
      withCredentials: true,
    });
    console.log('Fetched tasks:', res);
    return res;
  }
}
