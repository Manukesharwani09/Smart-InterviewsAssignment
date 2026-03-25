import { Routes } from '@angular/router';
import { authGuard } from '../auth/guards/auth.guard';

export const dashboardRoutes: Routes = [
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/overview/dashboard.page').then(m => m.DashboardPage)
  }
];
