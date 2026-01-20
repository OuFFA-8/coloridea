import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ProjectCard } from '../../../shared/components/project-card/project-card';
import { Project } from '../../../core/models/project';

@Component({
  selector: 'app-projects',
  standalone: true,
  imports: [ProjectCard],
  templateUrl: './projects.html',
})
export class Projects {
  constructor(private router: Router) {}

  projects: Project[] = [
    {
      id: 1,
      name: 'Website Redesign',
      client: 'Ahmed',
      status: 'active',
      progress: 70,
    },
    {
      id: 2,
      name: 'Mobile App',
      client: 'Mohamed',
      status: 'completed',
      progress: 100,
    },
    {
      id: 3,
      name: 'Dashboard System',
      client: 'Sara',
      status: 'pending',
      progress: 40,
    },
  ];

  openDetails(id: number) {
    this.router.navigate(['/admin/projects', id]);
  }
}
