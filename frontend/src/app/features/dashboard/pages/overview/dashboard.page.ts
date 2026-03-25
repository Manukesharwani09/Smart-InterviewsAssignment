import { CommonModule } from '@angular/common';
import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs';
import { Task, TaskPriority, TaskStatus } from '../../models/task.types';
import { TaskService } from '../../services/task.service';

interface StatCard {
  label: string;
  value: string;
  change: string;
  iconPath: string;
  iconViewBox: string;
  accentClass: string;
}

@Component({
  selector: 'app-dashboard-page',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.page.html',
})
export class DashboardPage implements OnInit {
  private readonly taskService = inject(TaskService);
  private readonly destroyRef = inject(DestroyRef);

  isLoading = false;
  loadError = false;
  tasks: Task[] = [];

  readonly statsCards: StatCard[] = [
    {
      label: 'Total Tasks',
      value: '42',
      change: '+4 vs last week',
      iconViewBox: '0 0 24 24',
      iconPath: 'M4 6h16M4 12h16M4 18h10',
      accentClass: 'text-blue-300',
    },
    {
      label: 'Completed Tasks',
      value: '24',
      change: '57% completion rate',
      iconViewBox: '0 0 24 24',
      iconPath: 'm5 12 4 4 10-10',
      accentClass: 'text-emerald-300',
    },
    {
      label: 'Pending Tasks',
      value: '14',
      change: 'Next up in backlog',
      iconViewBox: '0 0 24 24',
      iconPath: 'M12 6v6h4m4 0a8 8 0 1 1-16 0 8 8 0 0 1 16 0z',
      accentClass: 'text-amber-300',
    },
    {
      label: 'Completion %',
      value: '68%',
      change: '+6% vs prior sprint',
      iconViewBox: '0 0 24 24',
      iconPath: 'M12 6v6l4 2m4-2a8 8 0 1 1-16 0 8 8 0 0 1 16 0z',
      accentClass: 'text-indigo-300',
    },
  ];

  ngOnInit(): void {
    this.loadTasks();
  }

  loadTasks(): void {
    this.isLoading = true;
    this.loadError = false;

    this.taskService
      .getTasks()
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => {
          this.isLoading = false;
        })
      )
      .subscribe({
        next: (response) => {
          this.tasks = response.data?.tasks ?? [];
          this.loadError = false;
        },
        error: (error) => {
          this.loadError = true;
          console.error('Failed to load tasks', error);
        },
      });
  }

  retryLoad(): void {
    this.loadTasks();
  }

  get hasTasks(): boolean {
    return this.tasks.length > 0;
  }

  statusBadgeClasses(status: TaskStatus): string {
    const base = 'rounded-full border px-3 py-1 text-xs font-medium tracking-wide';
    const palette: Record<TaskStatus, string> = {
      todo: 'border-blue-500/40 bg-blue-500/10 text-blue-200',
      'in-progress': 'border-amber-400/40 bg-amber-500/10 text-amber-100',
      done: 'border-emerald-400/40 bg-emerald-500/10 text-emerald-100',
    };
    return `${base} ${palette[status]}`;
  }

  priorityBadgeClasses(priority: TaskPriority): string {
    const base = 'rounded-full border px-3 py-1 text-xs font-medium tracking-wide';
    const palette: Record<TaskPriority, string> = {
      high: 'border-rose-400/50 bg-rose-500/10 text-rose-100',
      medium: 'border-amber-400/40 bg-amber-500/10 text-amber-100',
      low: 'border-emerald-400/40 bg-emerald-500/10 text-emerald-100',
    };
    return `${base} ${palette[priority]}`;
  }
}
