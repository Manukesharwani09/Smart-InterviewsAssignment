import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { CreateTaskPayload, Task } from '../models/task.types';
import { TaskService } from './task.service';

@Injectable({ providedIn: 'root' })
export class TaskOperationsService {
  private readonly taskService = inject(TaskService);

  createTask(payload: CreateTaskPayload): Observable<Task> {
    return this.taskService.createTask(payload).pipe(
      map((response): Task => {
        if (!response.data) {
          throw new Error('Server returned an empty response for the created task.');
        }
        return response.data;
      })
    );
  }

  updateTask(taskId: string, payload: CreateTaskPayload): Observable<Task> {
    return this.taskService.updateTask(taskId, payload).pipe(
      map((response): Task => {
        if (!response.data) {
          throw new Error('Server returned an empty response for the updated task.');
        }
        return response.data;
      })
    );
  }
}
