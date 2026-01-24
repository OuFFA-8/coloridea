import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  {
    path: 'client/projects/:id',
    renderMode: RenderMode.Client,
  },
  {
    path: 'admin/projects/:id',
    renderMode: RenderMode.Client,
  },
  {
    path: 'admin/clients/:id',
    renderMode: RenderMode.Client,
  },
  {
    path: '**',
    renderMode: RenderMode.Prerender,
  },
];
