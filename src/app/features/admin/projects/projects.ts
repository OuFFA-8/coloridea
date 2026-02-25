import { ChangeDetectorRef, Component, inject, OnInit, PLATFORM_ID } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { environment } from '../../../../environments/environment';
import { AlertService } from '../../../core/services/alert-service/alert-service';
import { ProjectsService } from '../../../core/services/projects-service/projects-service';
import { LoadingService } from '../../../core/services/loading-service/loading-service';

@Component({
  selector: 'app-projects',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './projects.html',
  styleUrl: './projects.css',
})
export class Projects implements OnInit {
  private platformId = inject(PLATFORM_ID);
  private cdr = inject(ChangeDetectorRef);
  private loadingService = inject(LoadingService);

  projects: any[] = [];
  filteredProjects: any[] = [];
  isLoading = true;
  selectedStatus = 'all';
  baseUrl = environment.baseUrl;

  constructor(
    private router: Router,
    private projectsService: ProjectsService,
    private alert: AlertService,
  ) {}

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) this.loadProjects();
  }

  loadProjects() {
    this.isLoading = true;
    this.loadingService.show('Loading projects...');
    this.projectsService.getAllProjects().subscribe({
      next: (res) => {
        this.projects = [...res.data];
        this.filteredProjects = [...res.data];
        this.isLoading = false;
        this.loadingService.hide();
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.isLoading = false;
        this.loadingService.hide();
        this.cdr.detectChanges();
        this.alert.error(err.error?.message || 'Failed to load projects');
      },
    });
  }

  filterByStatus(status: string) {
    this.selectedStatus = status;
    this.filteredProjects =
      status === 'all'
        ? [...this.projects]
        : this.projects.filter((p) => p.status?.toLowerCase() === status);
  }

  getPhotoUrl(path: string | null): string {
    return path ? `${this.baseUrl}/${path.replace(/\\/g, '/')}` : '';
  }

  openDetails(id: string) {
    this.router.navigate(['/admin/projects', id]);
  }

  deleteProject(event: Event, id: string, name: string) {
    event.stopPropagation();
    this.alert.confirm(`Are you sure you want to delete "${name}"?`).then((result: any) => {
      if (result.isConfirmed) {
        this.loadingService.show('Deleting project...');
        this.projectsService.deleteProject(id).subscribe({
          next: () => {
            this.projects = this.projects.filter((p) => p._id !== id);
            this.filteredProjects = this.filteredProjects.filter((p) => p._id !== id);
            this.loadingService.hide();
            this.cdr.detectChanges();
            this.alert.success(`"${name}" deleted successfully`);
          },
          error: (err) => {
            this.loadingService.hide();
            this.alert.error(err.error?.message || 'Failed to delete project');
          },
        });
      }
    });
  }
}
