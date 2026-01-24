import { Injectable } from '@angular/core';
import { Project } from '../models/project';

@Injectable({
  providedIn: 'root',
})
export class ProjectsServices {
  private projects: Project[] = [
    {
      id: 1,
      name: 'New Capital Compound',
      description: 'Monthly construction progress coverage',
      status: 'active',
      progress: 72,
      clientId: 1,
    },
    {
      id: 2,
      name: 'Mall Construction',
      description: 'Aerial and ground photography',
      status: 'pending',
      progress: 30,
      clientId: 1,
    },
    {
      id: 3,
      name: 'Administrative Building',
      description: 'Timelapse and updates',
      status: 'completed',
      progress: 100,
      clientId: 2,
    },
  ];

  getAll() {
    return this.projects;
  }

  getById(id: number) {
    return this.projects.find((p) => p.id === id);
  }

  getByClient(clientId: number) {
    return this.projects.filter((p) => p.clientId === clientId);
  }
}
