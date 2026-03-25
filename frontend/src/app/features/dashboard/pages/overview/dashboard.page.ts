import { CommonModule } from '@angular/common';
import { Component, DestroyRef, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize, firstValueFrom } from 'rxjs';
import { TaskFormComponent } from '../../components/task-form/task-form.component';
import { CreateTaskPayload, Task, TaskPriority, TaskStatus } from '../../models/task.types';
import { TaskOperationsService } from '../../services/task-operations.service';
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
  standalone: true,
  imports: [CommonModule, TaskFormComponent],
  templateUrl: './dashboard.page.html',
})
export class DashboardPage implements OnInit {
  private readonly taskService = inject(TaskService);
  private readonly taskOperations = inject(TaskOperationsService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly cdr = inject(ChangeDetectorRef);

  isLoading = false;
  loadError = false;
  tasks: Task[] = [];
  showCreateModal = false;
  showEditModal = false;
  isSubmittingTask = false;
  isUpdatingTask = false;
  createError = '';
  editError = '';
  taskBeingEdited: Task | null = null;

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

  openCreateModal(): void {
    if (this.isSubmittingTask) {
      return;
    }
    this.createError = '';
    this.showCreateModal = true;
  }

  closeCreateModal(): void {
    this.showCreateModal = false;
    this.createError = '';
  }

  handleCancelCreate(): void {
    if (this.isSubmittingTask) {
      return;
    }
    this.closeCreateModal();
  }

  async handleCreateSubmit(payload: CreateTaskPayload): Promise<void> {
    this.createError = '';
    this.isSubmittingTask = true;
    let createdSuccessfully = false;

    try {
      const createdTask = await firstValueFrom(
        this.taskOperations.createTask(payload).pipe(takeUntilDestroyed(this.destroyRef))
      );
      this.tasks = [createdTask, ...this.tasks];
      createdSuccessfully = true;
    } catch (error) {
      this.createError = this.extractErrorMessage(error, 'Failed to create task. Please try again.');
    } finally {
      if (createdSuccessfully) {
        this.closeCreateModal();
        this.cdr.detectChanges();
      }
      this.isSubmittingTask = false;
    }
  }

  openEditModal(task: Task): void {
    if (this.isUpdatingTask) {
      return;
    }
    this.taskBeingEdited = task;
    this.editError = '';
    this.showEditModal = true;
  }

  closeEditModal(): void {
    this.showEditModal = false;
    this.taskBeingEdited = null;
    this.editError = '';
  }

  handleCancelEdit(): void {
    if (this.isUpdatingTask) {
      return;
    }
    this.closeEditModal();
  }

  async handleEditSubmit(payload: CreateTaskPayload): Promise<void> {
    if (!this.taskBeingEdited) {
      return;
    }
    this.editError = '';
    this.isUpdatingTask = true;
    let updatedSuccessfully = false;

    try {
      const updatedTask = await firstValueFrom(
        this.taskOperations.updateTask(this.taskBeingEdited._id, payload).pipe(takeUntilDestroyed(this.destroyRef))
      );
      this.tasks = this.tasks.map((existing: Task) => (existing._id === updatedTask._id ? updatedTask : existing));
      updatedSuccessfully = true;
    } catch (error) {
      this.editError = this.extractErrorMessage(error, 'Failed to update task. Please try again.');
    } finally {
      if (updatedSuccessfully) {
        this.closeEditModal();
        this.cdr.detectChanges();
      }
      this.isUpdatingTask = false;
    }
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

  private extractErrorMessage(error: unknown, fallback: string): string {
    if (!error) {
      return fallback;
    }

    if (typeof error === 'string') {
      return error;
    }

    if (error instanceof Error) {
      return error.message || fallback;
    }

    const maybeHttpError = error as { error?: { message?: string } };
    if (maybeHttpError?.error?.message) {
      return maybeHttpError.error.message;
    }

    return fallback;
  }
}
