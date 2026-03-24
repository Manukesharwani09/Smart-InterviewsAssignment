import { Routes } from '@angular/router';

export const dashboardRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/overview/dashboard.page').then(m => m.DashboardPage)
  }
];
