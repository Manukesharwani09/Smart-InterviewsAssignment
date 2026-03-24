import { Routes } from '@angular/router';

export const routes: Routes = [
	{
		path: '',
		pathMatch: 'full',
		redirectTo: 'dashboard'
	},
	{
		path: 'auth',
		loadChildren: () => import('./features/auth/auth.routes').then(m => m.authRoutes)
	},
	{
		path: 'dashboard',
		loadChildren: () => import('./features/dashboard/dashboard.routes').then(m => m.dashboardRoutes)
	},
	{
		path: '**',
		loadComponent: () => import('./shared/components/not-found/not-found.component').then(m => m.NotFoundComponent)
	}
];
