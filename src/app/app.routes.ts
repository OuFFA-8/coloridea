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
import { ClientDetails } from './features/admin/client-details/client-details';
import { Settings } from './features/admin/settings/settings';
import { Files } from './features/client/files/files';
import { Profile } from './features/client/profile/profile';

export const routes: Routes = [
  {
    path: 'login',
    component: AuthLayout,
    children: [{ path: '', component: Login }],
  },

  {
    path: 'client',
    component: ClientLayout,
    // canActivate: [authGuard],
    children: [
      { path: 'dashboard', component: ClientDashboard },
      { path: 'projects', component: ClientProject },
      { path: 'files', component: Files },
      { path: 'profile', component: Profile },
      { path: 'projects/:id', component: ProjectDetails },
    ],
  },

  {
    path: 'admin',
    component: AdminLayout,
    // canActivate: [authGuard, adminGuard],
    children: [
      { path: 'dashboard', component: AdminDashboard },
      { path: 'clients', component: Clients },
      { path: 'clients/:id', component: ClientDetails },
      { path: 'projects', component: Projects },
      { path: 'settings', component: Settings },
      { path: 'projects/:id', component: AdminProjectDetails },
    ],
  },

  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: '**', redirectTo: 'login' },
];
