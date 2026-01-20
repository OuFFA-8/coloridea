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
import { ClientDashboard } from './features/client/client-dashboard/client-dashboard';
import { ProjectDetails } from './features/client/project-details/project-details';
import { ClientProject } from './features/client/client-project/client-project';
import { AdminProjectDetails } from './features/admin/admin-project-details/admin-project-details';

export const routes: Routes = [
  {
    path: 'login',
    component: AuthLayout,
    children: [{ path: '', component: Login }],
  },

  {
    path: 'client',
    component: ClientLayout,
    canActivate: [authGuard],
    children: [
      { path: 'dashboard', component: ClientDashboard },
      { path: 'projects', component: ClientProject },
      { path: 'projects/:id', component: ProjectDetails },
    ],
  },

  {
    path: 'admin',
    component: AdminLayout,
    canActivate: [authGuard, adminGuard],
    children: [
      { path: 'dashboard', component: AdminDashboard },
      { path: 'clients', component: Clients },
      { path: 'projects', component: Projects }, // LIST
      { path: 'projects/:id', component: AdminProjectDetails }, // DETAILS
    ],
  },

  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: '**', redirectTo: 'login' },
];
