import { Component, input, output } from '@angular/core';
import { StatusBadge } from '../status-badge/status-badge';
import { ProgressBar } from '../progress-bar/progress-bar';

@Component({
  selector: 'app-project-card',
  imports: [StatusBadge, ProgressBar],
  templateUrl: './project-card.html',
  styleUrl: './project-card.css',
})
export class ProjectCard {
  title = input<string>();
  client = input<string>();
  status = input<'active' | 'pending' | 'completed'>('pending');
  progress = input<number>(0);

  view = output<void>();
}
