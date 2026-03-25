import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

type TaskStatus = 'Todo' | 'In Progress' | 'Done';
type TaskPriority = 'Low' | 'Medium' | 'High';

interface StatCard {
  label: string;
  value: string;
  change: string;
  iconPath: string;
  iconViewBox: string;
  accentClass: string;
}

interface TaskItem {
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  due: string;
}

@Component({
  selector: 'app-dashboard-page',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.page.html',
})
export class DashboardPage {
  readonly isLoading = false;

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

  readonly tasks: TaskItem[] = [
    {
      title: 'Finalize sprint retro',
      description: 'Collect feedback from product and engineering teams before Friday.',
      status: 'In Progress',
      priority: 'High',
      due: 'Due in 2 days',
    },
    {
      title: 'QA regression pass',
      description: 'Verify core workflows in staging ahead of release.',
      status: 'Todo',
      priority: 'Medium',
      due: 'Due next Monday',
    },
    {
      title: 'Customer onboarding deck',
      description: 'Refresh slides with latest automation metrics.',
      status: 'Done',
      priority: 'Low',
      due: 'Completed yesterday',
    },
  ];

  get hasTasks(): boolean {
    return this.tasks.length > 0;
  }

  statusBadgeClasses(status: TaskStatus): string {
    const base = 'rounded-full border px-3 py-1 text-xs font-medium tracking-wide';
    const palette: Record<TaskStatus, string> = {
      Todo: 'border-blue-500/40 bg-blue-500/10 text-blue-200',
      'In Progress': 'border-amber-400/40 bg-amber-500/10 text-amber-100',
      Done: 'border-emerald-400/40 bg-emerald-500/10 text-emerald-100',
    };
    return `${base} ${palette[status]}`;
  }

  priorityBadgeClasses(priority: TaskPriority): string {
    const base = 'rounded-full border px-3 py-1 text-xs font-medium tracking-wide';
    const palette: Record<TaskPriority, string> = {
      High: 'border-rose-400/50 bg-rose-500/10 text-rose-100',
      Medium: 'border-amber-400/40 bg-amber-500/10 text-amber-100',
      Low: 'border-emerald-400/40 bg-emerald-500/10 text-emerald-100',
    };
    return `${base} ${palette[priority]}`;
  }
}
