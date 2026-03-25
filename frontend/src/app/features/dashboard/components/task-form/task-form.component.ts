import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, inject } from '@angular/core';
import { FormBuilder, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { CreateTaskPayload, Task, TaskPriority, TaskStatus } from '../../models/task.types';

@Component({
  selector: 'app-task-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './task-form.component.html',
})
export class TaskFormComponent implements OnChanges {
  private readonly fb = inject(FormBuilder);

  @Input() task: Task | null = null;
  @Input() isSubmitting = false;
  @Input() errorMessage = '';
  @Output() submitTask = new EventEmitter<CreateTaskPayload>();
  @Output() cancel = new EventEmitter<void>();

  readonly taskForm = this.fb.nonNullable.group({
    title: ['', [Validators.required, Validators.minLength(3)]],
    description: [''],
    status: ['todo' as TaskStatus],
    priority: ['medium' as TaskPriority],
    dueDate: [''],
  });

  readonly statusOptions: Array<{ label: string; value: TaskStatus }> = [
    { label: 'Todo', value: 'todo' },
    { label: 'In Progress', value: 'in-progress' },
    { label: 'Done', value: 'done' },
  ];

  readonly priorityOptions: Array<{ label: string; value: TaskPriority }> = [
    { label: 'Low', value: 'low' },
    { label: 'Medium', value: 'medium' },
    { label: 'High', value: 'high' },
  ];

  statusMenuOpen = false;
  priorityMenuOpen = false;

  ngOnChanges(changes: SimpleChanges): void {
    if ('task' in changes) {
      const value = changes['task'].currentValue as Task | null;
      if (value) {
        this.patchFromTask(value);
      } else {
        this.resetForm();
      }
      this.closeOptionMenus();
    }
  }

  get titleControl(): FormControl<string> {
    return this.taskForm.controls.title;
  }

  get submitLabel(): string {
    return this.task ? 'Save changes' : 'Create task';
  }

  get statusLabel(): string {
    const value = this.taskForm.controls.status.value;
    return this.statusOptions.find((option) => option.value === value)?.label ?? 'Select status';
  }

  get priorityLabel(): string {
    const value = this.taskForm.controls.priority.value;
    return this.priorityOptions.find((option) => option.value === value)?.label ?? 'Select priority';
  }

  handleSubmit(): void {
    if (this.taskForm.invalid) {
      this.taskForm.markAllAsTouched();
      return;
    }

    const payload = this.buildPayload();
    this.closeOptionMenus();
    this.submitTask.emit(payload);
  }

  handleCancel(): void {
    this.closeOptionMenus();
    this.cancel.emit();
  }

  toggleStatusMenu(): void {
    this.statusMenuOpen = !this.statusMenuOpen;
    if (this.statusMenuOpen) {
      this.priorityMenuOpen = false;
    }
  }

  togglePriorityMenu(): void {
    this.priorityMenuOpen = !this.priorityMenuOpen;
    if (this.priorityMenuOpen) {
      this.statusMenuOpen = false;
    }
  }

  selectStatus(status: TaskStatus): void {
    this.taskForm.controls.status.setValue(status);
    this.statusMenuOpen = false;
  }

  selectPriority(priority: TaskPriority): void {
    this.taskForm.controls.priority.setValue(priority);
    this.priorityMenuOpen = false;
  }

  private buildPayload(): CreateTaskPayload {
    const value = this.taskForm.getRawValue();
    return {
      title: value.title.trim(),
      description: value.description?.trim() || undefined,
      status: value.status,
      priority: value.priority,
      dueDate: value.dueDate ? value.dueDate : undefined,
    };
  }

  private patchFromTask(task: Task): void {
    this.taskForm.setValue({
      title: task.title,
      description: task.description ?? '',
      status: task.status ?? 'todo',
      priority: task.priority ?? 'medium',
      dueDate: task.dueDate ?? '',
    });
  }

  private resetForm(): void {
    this.taskForm.reset({
      title: '',
      description: '',
      status: 'todo',
      priority: 'medium',
      dueDate: '',
    });
  }

  private closeOptionMenus(): void {
    this.statusMenuOpen = false;
    this.priorityMenuOpen = false;
  }
}
