import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnInit,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

import { TimelapseService } from '../../../core/services/timelapse-service/timelapse-service';

interface SelectedProject {
  _id?: string;
  id?: string;
  projectId?: string;
}

@Component({
  selector: 'app-timelapses',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './timelapses.html',
  styleUrl: './timelapses.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Timelapses implements OnInit {
  private readonly timelapseService = inject(TimelapseService);
  private readonly router = inject(Router);
  private readonly cdr = inject(ChangeDetectorRef);

  loading = true;
  error = '';

  projectId = '';

  ngOnInit(): void {
    this.getSelectedProject();
  }

  private getSelectedProject(): void {
    try {
      const selectedProjectRaw = localStorage.getItem('selectedProject');

      if (!selectedProjectRaw) {
        this.loading = false;
        this.error = 'NO_PROJECT_SELECTED';
        this.cdr.detectChanges();
        return;
      }

      const selectedProject: SelectedProject = JSON.parse(selectedProjectRaw);

      this.projectId = selectedProject._id || selectedProject.id || selectedProject.projectId || '';

      if (!this.projectId) {
        this.loading = false;
        this.error = 'PROJECT_NOT_FOUND';
        this.cdr.detectChanges();
        return;
      }

      this.loadTimelapse();
    } catch (error) {
      console.error('Error reading selected project:', error);

      this.loading = false;
      this.error = 'ERROR_BODY';
      this.cdr.detectChanges();
    }
  }

  private loadTimelapse(): void {
    this.loading = true;
    this.error = '';

    this.timelapseService.getProjectTimelapse(this.projectId).subscribe({
      next: (response) => {
        const timelapse = response?.data?.[0] ?? null;

        if (!timelapse?.link) {
          this.loading = false;
          this.error = 'EMPTY';
          this.cdr.detectChanges();
          return;
        }

        // Same viewer used across the app for watching a timelapse/camera feed
        this.router.navigate(['/client/timelapse-viewer'], {
          queryParams: {
            url: timelapse.link,
            name: timelapse.name,
            projectId: this.projectId,
            bg: timelapse.backgroundColor || '#0a0a0a',
          },
          replaceUrl: true,
        });
      },

      error: (error) => {
        console.error('Error loading timelapse:', error);

        this.loading = false;
        this.error = 'ERROR_BODY';
        this.cdr.detectChanges();
      },
    });
  }

  reload(): void {
    this.loadTimelapse();
  }
}