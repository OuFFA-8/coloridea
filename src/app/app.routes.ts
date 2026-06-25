import { adminGuard } from './core/guards/admin-guard';
import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth-guard';

export const routes: Routes = [
  // ===== AUTH =====
  {
    path: 'login',
    loadComponent: () => import('./layouts/auth-layout/auth-layout').then(m => m.AuthLayout),
    children: [
      { path: '', loadComponent: () => import('./features/auth/login/login').then(m => m.Login) },
      { path: 'forget-password', loadComponent: () => import('./features/auth/forgot-password/forgot-password').then(m => m.ForgotPassword) },
      { path: 'reset-password/:token', loadComponent: () => import('./features/auth/reset-password/reset-password').then(m => m.ResetPassword) },
    ],
  },

  {
    path: 'client/reset-password/:token',
    loadComponent: () => import('./layouts/auth-layout/auth-layout').then(m => m.AuthLayout),
    children: [
      { path: '', loadComponent: () => import('./features/auth/reset-password/reset-password').then(m => m.ResetPassword) },
    ],
  },

  {
    path: 'select-project',
    loadComponent: () => import('./features/client/project-select/project-select').then(m => m.ProjectSelect),
    canActivate: [authGuard],
  },

  {
    path: 'cameras',
    loadComponent: () => import('./features/client/client-cameras/client-cameras').then(m => m.ClientCameras),
    canActivate: [authGuard],
  },

  // ===== CLIENT =====
  {
    path: 'client',
    loadComponent: () => import('./layouts/client-layout/client-layout').then(m => m.ClientLayout),
    canActivate: [authGuard],
    children: [
      { path: 'profile', loadComponent: () => import('./features/client/profile/profile').then(m => m.Profile) },
      { path: 'settings', loadComponent: () => import('./features/client/client-settings/client-settings').then(m => m.ClientSettings) },
      { path: 'managers', loadComponent: () => import('./features/client/managers/managers').then(m => m.Managers) },
      { path: 'verify-email/:token', loadComponent: () => import('./features/client/verify-email/verify-email').then(m => m.VerifyEmail) },
      { path: 'files', loadComponent: () => import('./features/client/files/files').then(m => m.Files) },
      {
        path: 'projects/:id',
        children: [
          { path: '', loadComponent: () => import('./features/client/project-details/project-details').then(m => m.ProjectDetails) },
          { path: 'deliverables', loadComponent: () => import('./features/client/deliverables/deliverables').then(m => m.Deliverables) },
          { path: 'financials', loadComponent: () => import('./features/client/financials/financials').then(m => m.Financials) },
        ],
      },
      { path: '', redirectTo: 'profile', pathMatch: 'full' },
    ],
  },

  // ===== ADMIN =====
  {
    path: 'admin',
    loadComponent: () => import('./layouts/admin-layout/admin-layout').then(m => m.AdminLayout),
    canActivate: [adminGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', loadComponent: () => import('./features/admin/admin-dashboard/admin-dashboard').then(m => m.AdminDashboard) },
      { path: 'clients', loadComponent: () => import('./features/admin/clients/clients').then(m => m.Clients) },
      { path: 'clients/:id', loadComponent: () => import('./features/admin/client-details/client-details').then(m => m.ClientDetails) },
      { path: 'projects', loadComponent: () => import('./features/admin/projects/projects').then(m => m.Projects) },
      { path: 'projects/:id', loadComponent: () => import('./features/admin/admin-project-details/admin-project-details').then(m => m.AdminProjectDetails) },
      { path: 'settings', loadComponent: () => import('./features/admin/settings/settings').then(m => m.Settings) },
      { path: 'verify-email/:token', loadComponent: () => import('./features/admin/admin-verify-email/admin-verify-email').then(m => m.AdminVerifyEmail) },
    ],
  },

  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: '**', redirectTo: 'login' },
];
