import { Project } from '../../../core/models/project';
import { ChangeDetectorRef, Component, inject, OnInit, PLATFORM_ID } from '@angular/core';
import { Router } from '@angular/router';
import { ProjectCard } from '../../../shared/components/project-card/project-card';
import { isPlatformBrowser } from '@angular/common';
import { environment } from '../../../../environments/environment';
import { AlertService } from '../../../core/services/alert-service/alert-service';
import { ProjectsService } from '../../../core/services/projects-service/projects-service';

@Component({
  selector: 'app-projects',
  standalone: true,
  imports: [],
  templateUrl: './projects.html',
})
export class Projects implements OnInit {
  private platformId = inject(PLATFORM_ID);
  private cdr = inject(ChangeDetectorRef);

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
    if (isPlatformBrowser(this.platformId)) {
      this.loadProjects();
    }
  }

  loadProjects() {
    this.isLoading = true;
    this.projectsService.getAllProjects().subscribe({
      next: (res) => {
        this.projects = [...res.data];
        this.filteredProjects = [...res.data];
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.isLoading = false;
        this.cdr.detectChanges();
        this.alert.error(err.error?.message || 'Failed to load projects');
      },
    });
  }

  filterByStatus(status: string) {
    this.selectedStatus = status;
    if (status === 'all') {
      this.filteredProjects = [...this.projects];
    } else {
      this.filteredProjects = this.projects.filter((p) => p.status?.toLowerCase() === status);
    }
  }

  getPhotoUrl(path: string | null): string {
    if (!path) return '';
    return `${this.baseUrl}/${path.replace(/\\/g, '/')}`;
  }

  openDetails(id: string) {
    this.router.navigate(['/admin/projects', id]);
  }

  deleteProject(event: Event, id: string, name: string) {
    event.stopPropagation();
    this.alert.confirm(`Are you sure you want to delete "${name}"?`).then((result: any) => {
      if (result.isConfirmed) {
        this.projectsService.deleteProject(id).subscribe({
          next: () => {
            this.projects = this.projects.filter((p) => p._id !== id);
            this.filteredProjects = this.filteredProjects.filter((p) => p._id !== id);
            this.cdr.detectChanges();
            this.alert.success(`"${name}" deleted successfully`);
          },
          error: (err) => {
            this.alert.error(err.error?.message || 'Failed to delete project');
          },
        });
      }
    });
  }
}
