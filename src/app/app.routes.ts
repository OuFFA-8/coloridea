import { Deliverables } from './features/client/deliverables/deliverables';
import { Projects } from './features/admin/projects/projects';
import { adminGuard } from './core/guards/admin-guard';
import { Routes } from '@angular/router';

import { AuthLayout } from './layouts/auth-layout/auth-layout';
import { ClientLayout } from './layouts/client-layout/client-layout';
import { AdminLayout } from './layouts/admin-layout/admin-layout';

import { Login } from './features/auth/login/login';

import { Clients } from './features/admin/clients/clients';
import { authGuard } from './core/guards/auth-guard';
import { AdminDashboard } from './features/admin/admin-dashboard/admin-dashboard';
import { ProjectDetails } from './features/client/project-details/project-details';
import { AdminProjectDetails } from './features/admin/admin-project-details/admin-project-details';
import { ClientDetails } from './features/admin/client-details/client-details';
import { Settings } from './features/admin/settings/settings';
import { Profile } from './features/client/profile/profile';
import { Financials } from './features/client/financials/financials';
import { Files } from './features/client/files/files';
import { ForgotPassword } from './features/auth/forgot-password/forgot-password';
import { ResetPassword } from './features/auth/reset-password/reset-password';
import { VerifyEmail } from './features/client/verify-email/verify-email';
import { ProjectSelect } from './features/client/project-select/project-select';

export const routes: Routes = [
  // ===== AUTH =====
  {
    path: 'login',
    component: AuthLayout,
    children: [
      { path: '', component: Login },
      { path: 'forget-password', component: ForgotPassword },
      { path: 'reset-password/:token', component: ResetPassword },
    ],
  },

  // ===== SELECT PROJECT (standalone - بدون ClientLayout) =====
  {
    path: 'select-project',
    component: ProjectSelect,
    canActivate: [authGuard],
  },

  // ===== CLIENT =====
  {
    path: 'client',
    component: ClientLayout,
    canActivate: [authGuard],
    children: [
      { path: 'profile', component: Profile },
      { path: 'verify-email/:token', component: VerifyEmail },
      { path: 'files', component: Files },

      // nested project routes — الـ sidebar بيقرأ الـ :id من الـ URL
      {
        path: 'projects/:id',
        children: [
          { path: '', component: ProjectDetails },
          { path: 'deliverables', component: Deliverables },
          { path: 'financials', component: Financials },
        ],
      },

      { path: '', redirectTo: 'profile', pathMatch: 'full' },
    ],
  },

  // ===== ADMIN =====
  {
    path: 'admin',
    component: AdminLayout,
    canActivate: [adminGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: AdminDashboard },
      { path: 'clients', component: Clients },
      { path: 'clients/:id', component: ClientDetails },
      { path: 'projects', component: Projects },
      { path: 'projects/:id', component: AdminProjectDetails },
      { path: 'settings', component: Settings },
    ],
  },

  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: '**', redirectTo: 'login' },
];
