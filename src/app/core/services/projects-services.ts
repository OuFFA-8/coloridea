import { Injectable } from '@angular/core';
import { Project } from '../models/project';
import { Clients } from '../interfaces/clients/clients';

@Injectable({
  providedIn: 'root',
})
export class ProjectsServices {
  private clients: Clients[] = [
    {
      id: 1,
      nameEn: 'Capital Group',
      nameAr: 'مجموعة كابيتال',
      email: 'info@capital.com',
      password: '****',
      logoUrl: 'logo1.png',
      patternId: 'p-1',
      createdAt: new Date(),
    },
  ];

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

  getClients() {
    return this.clients;
  }
  getClientById(id: number): Clients | undefined {
    return this.clients.find((c) => c.id === id);
  }

  addClient(newClient: Omit<Clients, 'id' | 'createdAt'>) {
    const client: Clients = {
      ...newClient,
      id: this.clients.length + 1,
      createdAt: new Date(),
    };
    this.clients.push(client);
    console.log('Current Clients:', this.clients);
  }

  addProject(project: any) {
    const newProj = {
      ...project,
      id: this.projects.length + 1,
      // ممكن تضيف داتا افتراضية هنا زي التاريخ
      date: new Date().toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      }),
    };
    this.projects.push(newProj);
  }
}
