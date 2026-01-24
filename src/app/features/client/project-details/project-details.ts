import { ChartCard } from './../../../shared/components/chart-card/chart-card';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Project } from '../../../core/models/project';
import { ProjectsServices } from '../../../core/services/projects-services';
import { CommonModule } from '@angular/common';
import { StatusBadge } from '../../../shared/components/status-badge/status-badge';
import { ProgressBar } from '../../../shared/components/progress-bar/progress-bar';

@Component({
  selector: 'app-project-details',
  standalone: true,
  imports: [CommonModule, ChartCard],
  templateUrl: './project-details.html',
  styleUrl: './project-details.css',
})
export class ProjectDetails implements OnInit {
  project!: Project;

  pieData = [40, 30, 30];
  lineData = [10, 25, 40, 60, 80];

  constructor(
    private route: ActivatedRoute,
    private projectsService: ProjectsServices,
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.project = this.projectsService.getById(id)!;
  }
}
