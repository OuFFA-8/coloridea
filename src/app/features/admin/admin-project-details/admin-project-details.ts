import { Component, computed, OnInit } from '@angular/core';
import { ProgressBar } from '../../../shared/components/progress-bar/progress-bar';
import { Project } from '../../../core/models/project';
import { ProjectsServices } from '../../../core/services/projects-services';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-admin-project-details',
  imports: [],
  templateUrl: './admin-project-details.html',
  styleUrl: './admin-project-details.css',
})
export class AdminProjectDetails implements OnInit {
  project!: Project; // ← دي أهم سطر كان ناقصك

  constructor(
    private route: ActivatedRoute,
    private projectsService: ProjectsServices,
  ) {}

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.project = this.projectsService.getById(id)!;
  }
}
