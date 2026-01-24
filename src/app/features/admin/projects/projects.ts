import { Project } from '../../../core/models/project';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ProjectCard } from '../../../shared/components/project-card/project-card';
import { ProjectsServices } from '../../../core/services/projects-services';

@Component({
  selector: 'app-projects',
  standalone: true,
  imports: [],
  templateUrl: './projects.html',
})
export class Projects {
  projects: Project[] = [];

  constructor(
    private router: Router,
    private projectsService: ProjectsServices,
  ) {}

  ngOnInit() {
    this.projects = this.projectsService.getAll();
  }

  openDetails(id: number) {
    this.router.navigate(['/admin/projects', id]);
  }
}
