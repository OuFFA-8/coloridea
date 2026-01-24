import { Component, Input, input, output } from '@angular/core';
import { StatusBadge } from '../status-badge/status-badge';
import { ProgressBar } from '../progress-bar/progress-bar';
import { ProjectStatus } from '../../../core/models/project';
import { Router } from '@angular/router';

@Component({
  selector: 'app-project-card',
  imports: [ProgressBar, StatusBadge],
  templateUrl: './project-card.html',
  styleUrl: './project-card.css',
})
export class ProjectCard {
  @Input() id!: number;
  @Input() name!: string;
  @Input() status!: ProjectStatus;
  @Input() progress!: number;
  @Input() clientId!: number;

  constructor(private router: Router) {}

  open() {
    this.router.navigate(['/client/projects', this.id]);
  }
}
