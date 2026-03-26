import { CommonModule } from '@angular/common';
import { Component, DestroyRef, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Subject, catchError, debounceTime, distinctUntilChanged, finalize, firstValueFrom, of, retry, switchMap, tap, timeout } from 'rxjs';
import { TaskFormComponent } from '../../components/task-form/task-form.component';
import { TaskSummaryComponent } from '../../components/task-summary/task-summary.component';
import { CreateTaskPayload, Task, TaskPriority, TaskStatus } from '../../models/task.types';
import { TaskOperationsService } from '../../services/task-operations.service';
import { TaskAnalyticsSummary, TaskQueryParams, TaskService } from '../../services/task.service';

interface StatCard {
  label: string;
  value: string;
  iconPath: string;
  iconViewBox: string;
  accentClass: string;
}

type AnalyticsTotals = {
  total: number;
  completed: number;
  pending: number;
  completionPercentage: number;
};

@Component({
  standalone: true,
  imports: [CommonModule, TaskFormComponent, TaskSummaryComponent],
  templateUrl: './dashboard.page.html',
})
export class DashboardPage implements OnInit {
    // Custom dropdown state and options for filters/sort
    statusMenuOpen = false;
    priorityMenuOpen = false;
    sortMenuOpen = false;

    statusOptions = [
      { value: 'all', label: 'All' },
      { value: 'todo', label: 'Todo' },
      { value: 'in-progress', label: 'In Progress' },
      { value: 'done', label: 'Done' },
    ];
    priorityOptions = [
      { value: 'all', label: 'All' },
      { value: 'high', label: 'High' },
      { value: 'medium', label: 'Medium' },
      { value: 'low', label: 'Low' },
    ];
    sortOptions = [
      { value: 'dueDate', label: 'Due Date' },
      { value: 'priority', label: 'Priority' },
    ];

    get statusLabel(): string {
      return this.statusOptions.find(opt => opt.value === this.statusFilter)?.label || 'All';
    }
    get priorityLabel(): string {
      return this.priorityOptions.find(opt => opt.value === this.priorityFilter)?.label || 'All';
    }
    get sortLabel(): string {
      return this.sortOptions.find(opt => opt.value === this.sortBy)?.label || 'Due Date';
    }

    toggleStatusMenu(): void {
      this.statusMenuOpen = !this.statusMenuOpen;
      if (this.statusMenuOpen) {
        this.priorityMenuOpen = false;
        this.sortMenuOpen = false;
      }
    }
    togglePriorityMenu(): void {
      this.priorityMenuOpen = !this.priorityMenuOpen;
      if (this.priorityMenuOpen) {
        this.statusMenuOpen = false;
        this.sortMenuOpen = false;
      }
    }
    toggleSortMenu(): void {
      this.sortMenuOpen = !this.sortMenuOpen;
      if (this.sortMenuOpen) {
        this.statusMenuOpen = false;
        this.priorityMenuOpen = false;
      }
    }

    selectStatus(value: string): void {
      this.statusFilter = value as TaskStatus | 'all';
      this.statusMenuOpen = false;
      this.page = 1;
      this.loadTasks();
    }
    selectPriority(value: string): void {
      this.priorityFilter = value as TaskPriority | 'all';
      this.priorityMenuOpen = false;
      this.page = 1;
      this.loadTasks();
    }
    selectSort(value: string): void {
      if (value !== 'priority' && value !== 'dueDate') {
        return;
      }
      this.sortBy = value;
      this.sortOrder = value === 'priority' ? 'desc' : 'asc';
      this.sortMenuOpen = false;
      this.page = 1;
      this.loadTasks();
    }
  private readonly taskService = inject(TaskService);
  private readonly taskOperations = inject(TaskOperationsService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly cdr = inject(ChangeDetectorRef);

  isLoading = false;
  isAnalyticsLoading = true;
  loadError = false;
  tasks: Task[] = [];
  showCreateModal = false;
  showEditModal = false;
  isSubmittingTask = false;
  isUpdatingTask = false;
  createError = '';
  editError = '';
  taskBeingEdited: Task | null = null;
  deletingTaskId: string | null = null;
  searchInputValue = '';
  searchTerm = '';
  statusFilter: 'all' | TaskStatus = 'all';
  priorityFilter: 'all' | TaskPriority = 'all';
  sortBy: 'dueDate' | 'priority' = 'dueDate';
  sortOrder: 'asc' | 'desc' = 'asc';
  page = 1;
  limit = 10;
  totalPages = 1;
  totalTasks = 0;
  private readonly defaultAnalytics: AnalyticsTotals = {
    total: 0,
    completed: 0,
    pending: 0,
    completionPercentage: 0,
  };
  analytics: AnalyticsTotals = {
    total: 0,
    completed: 0,
    pending: 0,
    completionPercentage: 0,
  };
  hasAnalyticsLoaded = false;
  private hasSuccessfulTaskLoad = false;
  private initialLoadRetryAttempted = false;
  private initialLoadRetryHandle: ReturnType<typeof setTimeout> | null = null;

  constructor() {
    this.destroyRef.onDestroy(() => {
      if (this.initialLoadRetryHandle) {
        clearTimeout(this.initialLoadRetryHandle);
        this.initialLoadRetryHandle = null;
      }
    });
  }
  private readonly searchTermChanges$ = new Subject<string>();
  private readonly taskLoadTrigger$ = new Subject<void>();

  readonly statsCards: StatCard[] = [
    {
      label: 'Total Tasks',
      value: '--',
      iconViewBox: '0 0 24 24',
      iconPath: 'M4 6h16M4 12h16M4 18h10',
      accentClass: 'text-blue-300',
    },
    {
      label: 'Completed Tasks',
      value: '--',
      iconViewBox: '0 0 24 24',
      iconPath: 'm5 12 4 4 10-10',
      accentClass: 'text-emerald-300',
    },
    {
      label: 'Pending Tasks',
      value: '--',
      iconViewBox: '0 0 24 24',
      iconPath: 'M12 6v6h4m4 0a8 8 0 1 1-16 0 8 8 0 0 1 16 0z',
      accentClass: 'text-amber-300',
    },
    {
      label: 'Completion %',
      value: '--',
      iconViewBox: '0 0 24 24',
      iconPath: 'M12 6v6l4 2m4-2a8 8 0 1 1-16 0 8 8 0 0 1 16 0z',
      accentClass: 'text-indigo-300',
    },
  ];

  ngOnInit(): void {
    this.searchTermChanges$
      .pipe(debounceTime(400), distinctUntilChanged(), takeUntilDestroyed(this.destroyRef))
      .subscribe((term) => {
        this.searchTerm = term.trim();
        this.page = 1;
        this.loadTasks();
      });

    this.initializeTaskStream();
    this.loadTasks();
    void this.loadAnalytics();
  }

  private initializeTaskStream(): void {
    this.taskLoadTrigger$
      .pipe(
        tap(() => {
          this.isLoading = true;
          this.loadError = false;
        }),
        switchMap(() =>
          this.taskService
            .getTasks(this.buildQueryParams())
            .pipe(
              timeout({ each: 10000 }),
              retry({ count: 1, delay: 1000 }),
              catchError((error) => {
                this.loadError = true;
                console.error('Failed to load tasks', error);
                return of(null);
              }),
              finalize(() => {
                this.isLoading = false;
                this.cdr.markForCheck();
              })
            )
        ),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((response) => {
        if (!response?.data) {
          this.scheduleInitialTaskRetry();
          return;
        }

        const payload = response.data;
        this.tasks = payload.tasks ?? [];
        const meta = (payload.meta ?? {}) as { total?: number; page?: number; totalPages?: number };
        const derivedTotalPages = Number(meta?.totalPages ?? 1);
        this.totalPages = Number.isFinite(derivedTotalPages) && derivedTotalPages > 0 ? derivedTotalPages : 1;
        const nextPage = Number(meta?.page ?? this.page);
        this.page = Number.isFinite(nextPage) && nextPage > 0 ? nextPage : 1;
        const total = Number(meta?.total ?? this.tasks.length);
        this.totalTasks = Number.isFinite(total) && total >= 0 ? total : this.tasks.length;

        this.loadError = false;
        this.hasSuccessfulTaskLoad = true;
        this.initialLoadRetryAttempted = false;
        if (this.initialLoadRetryHandle) {
          clearTimeout(this.initialLoadRetryHandle);
          this.initialLoadRetryHandle = null;
        }
        this.cdr.markForCheck();
      });
  }

  private async loadAnalytics(): Promise<void> {
    this.isAnalyticsLoading = true;

    try {
      const response = await firstValueFrom(
        this.taskService
          .getAnalytics()
          .pipe(timeout({ each: 10000 }), retry({ count: 1, delay: 1000 }), takeUntilDestroyed(this.destroyRef))
      );

      const totals = response?.data?.totals ?? ({} as TaskAnalyticsSummary['totals']);
      this.analytics = {
        total: this.toSafeNumber(totals?.total),
        completed: this.toSafeNumber(totals?.completed),
        pending: this.toSafeNumber(totals?.pending),
        completionPercentage: this.formatPercentage(totals?.completionPercentage),
      };
      this.hasAnalyticsLoaded = true;
      this.updateStatCardValues();
    } catch (error) {
      console.error('Failed to load analytics', error);
      this.analytics = { ...this.defaultAnalytics };
      this.hasAnalyticsLoaded = true;
      this.updateStatCardValues();
    } finally {
      this.isAnalyticsLoading = false;
      this.cdr.markForCheck();
    }
  }

  loadTasks(): void {
    this.taskLoadTrigger$.next();
  }

  handleSearchInput(value: string): void {
    this.searchInputValue = value;
    this.searchTermChanges$.next(value);
  }

  handleStatusFilterChange(value: string): void {
    this.statusFilter = value as TaskStatus | 'all';
    this.page = 1;
    this.loadTasks();
  }

  handlePriorityFilterChange(value: string): void {
    this.priorityFilter = value as TaskPriority | 'all';
    this.page = 1;
    this.loadTasks();
  }

  handleSortChange(value: string): void {
    if (value !== 'priority' && value !== 'dueDate') {
      return;
    }
    this.sortBy = value;
    this.sortOrder = value === 'priority' ? 'desc' : 'asc';
    this.page = 1;
    this.loadTasks();
  }

  goToPreviousPage(): void {
    if (this.page === 1) {
      return;
    }
    this.page -= 1;
    this.loadTasks();
  }

  goToNextPage(): void {
    if (this.page >= this.totalPages) {
      return;
    }
    this.page += 1;
    this.loadTasks();
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
      if (this.page === 1) {
        this.tasks = [createdTask, ...this.tasks].slice(0, this.limit);
      }
      this.totalTasks += 1;
      createdSuccessfully = true;
    } catch (error) {
      this.createError = this.extractErrorMessage(error, 'Failed to create task. Please try again.');
    } finally {
      if (createdSuccessfully) {
        this.closeCreateModal();
        this.cdr.detectChanges();
        this.page = 1;
        this.loadTasks();
        void this.loadAnalytics();
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
        void this.loadAnalytics();
      }
      this.isUpdatingTask = false;
    }
  }

  async handleDeleteTask(taskId: string): Promise<void> {
    const confirmed = window.confirm('Are you sure you want to delete this task?');
    if (!confirmed) {
      return;
    }

    this.deletingTaskId = taskId;

    try {
      await firstValueFrom(this.taskService.deleteTask(taskId).pipe(takeUntilDestroyed(this.destroyRef)));
      this.tasks = this.tasks.filter((task) => task._id !== taskId);
      this.totalTasks = Math.max(0, this.totalTasks - 1);
      const estimatedPages = Math.max(1, Math.ceil(this.totalTasks / this.limit));
      this.totalPages = estimatedPages;
      void this.loadAnalytics();
    } catch (error) {
      console.error('Failed to delete task', error);
      window.alert('Failed to delete task');
    } finally {
      this.deletingTaskId = null;
      this.cdr.detectChanges();
      if (!this.tasks.length && this.page > 1) {
        this.page -= 1;
        this.loadTasks();
      } else if (this.tasks.length < this.limit && this.totalTasks >= (this.page - 1) * this.limit) {
        this.loadTasks();
      }
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

  private scheduleInitialTaskRetry(): void {
    if (this.hasSuccessfulTaskLoad || this.initialLoadRetryAttempted) {
      return;
    }
    this.initialLoadRetryAttempted = true;
    this.initialLoadRetryHandle = setTimeout(() => {
      this.initialLoadRetryHandle = null;
      this.loadTasks();
    }, 1200);
  }

  private updateStatCardValues(): void {
    this.statsCards.forEach((card) => {
      switch (card.label) {
        case 'Total Tasks':
          card.value = this.analytics.total.toString();
          break;
        case 'Completed Tasks':
          card.value = this.analytics.completed.toString();
          break;
        case 'Pending Tasks':
          card.value = this.analytics.pending.toString();
          break;
        case 'Completion %':
          card.value = `${this.analytics.completionPercentage}%`;
          break;
        default:
          break;
      }
    });
  }

  private toSafeNumber(value: unknown): number {
    const numeric = Number(value);
    if (!Number.isFinite(numeric) || numeric < 0) {
      return 0;
    }
    return Math.round(numeric);
  }

  private formatPercentage(value: unknown): number {
    const numeric = Number(value);
    if (!Number.isFinite(numeric) || numeric < 0) {
      return 0;
    }
    return Number(numeric.toFixed(1));
  }

  private buildQueryParams(): TaskQueryParams {
    const params: TaskQueryParams = {
      page: this.page,
      limit: this.limit,
      sortBy: this.sortBy,
      sortOrder: this.sortOrder,
    };

    if (this.statusFilter !== 'all') {
      params.status = this.statusFilter;
    }

    if (this.priorityFilter !== 'all') {
      params.priority = this.priorityFilter;
    }

    if (this.searchTerm) {
      params.search = this.searchTerm;
    }

    return params;
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
