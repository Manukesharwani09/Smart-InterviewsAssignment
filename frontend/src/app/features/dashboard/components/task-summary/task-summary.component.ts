import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { Task } from '../../models/task.types';

type PrioritySummary = {
  total: number;
  low: number;
  medium: number;
  high: number;
};

@Component({
  selector: 'app-task-summary',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './task-summary.component.html',
})
export class TaskSummaryComponent {
  private _tasks: Task[] = [];

  summary: PrioritySummary = {
    total: 0,
    low: 0,
    medium: 0,
    high: 0,
  };

  @Input() set tasks(value: Task[] | null) {
    this._tasks = value ?? [];
    this.computeSummary();
  }

  private computeSummary(): void {
    const counts: PrioritySummary = {
      total: this._tasks.length,
      low: 0,
      medium: 0,
      high: 0,
    };

    for (const task of this._tasks) {
      switch (task?.priority) {
        case 'low':
          counts.low += 1;
          break;
        case 'medium':
          counts.medium += 1;
          break;
        case 'high':
          counts.high += 1;
          break;
        default:
          break;
      }
    }

    this.summary = counts;
  }
}
