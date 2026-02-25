import { ChangeDetectorRef, Component, inject, OnInit, PLATFORM_ID } from '@angular/core';
import { ChartCard } from '../../../shared/components/chart-card/chart-card';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { environment } from '../../../../environments/environment';
import { AuthServices } from '../../../core/services/auth-services/auth-services';
import { ProjectsService } from '../../../core/services/projects-service/projects-service';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-client-dashboard',
  imports: [CommonModule, TranslateModule],
  templateUrl: './client-dashboard.html',
  styleUrl: './client-dashboard.css',
})
export class ClientDashboard implements OnInit {
  private platformId = inject(PLATFORM_ID);
  private cdr = inject(ChangeDetectorRef);

  user: any = null;
  projects: any[] = [];
  isLoading = true;
  baseUrl = environment.baseUrl;

  constructor(
    private authServices: AuthServices,
    private projectsService: ProjectsService,
    private router: Router,
  ) {}

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.user = this.authServices.getUser();
      this.loadProjects();
    }
  }

  loadProjects() {
    if (!this.user?._id) {
      this.isLoading = false;
      return;
    }
    this.projectsService.getUserProjects(this.user._id).subscribe({
      next: (res) => {
        this.projects = res.data || [];
        if (this.projects.length === 1) {
          this.router.navigate(['/client/projects', this.projects[0]._id]);
          return;
        }
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.isLoading = false;
        this.cdr.detectChanges();
      },
    });
  }

  get activeCount(): number {
    return this.projects.filter((p) => p.status === 'active').length;
  }
  get completedCount(): number {
    return this.projects.filter((p) => p.status === 'completed').length;
  }

  getPhotoUrl(path: string | null): string {
    return path ? `${this.baseUrl}/${path.replace(/\\/g, '/')}` : '';
  }

  openProject(id: string) {
    this.router.navigate(['/client/projects', id]);
  }
}
