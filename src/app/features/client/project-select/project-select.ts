import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ChangeDetectorRef, Component, inject, OnInit, PLATFORM_ID } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { environment } from '../../../../environments/environment';
import { AuthServices } from '../../../core/services/auth-services/auth-services';
import { ProjectsService } from '../../../core/services/projects-service/projects-service';
import { LoadingService } from '../../../core/services/loading-service/loading-service';

@Component({
  selector: 'app-project-select',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './project-select.html',
  styleUrl: './project-select.css',
})
export class ProjectSelect implements OnInit {
  private platformId = inject(PLATFORM_ID);
  private cdr = inject(ChangeDetectorRef);
  private loadingService = inject(LoadingService);

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
      if (!this.user?._id) {
        this.router.navigate(['/login']);
        return;
      }
      this.loadingService.show('Loading...');
      this.projectsService.getUserProjects(this.user._id).subscribe({
        next: (res) => {
          this.projects = res.data || [];
          this.loadingService.hide();
          if (this.projects.length === 0) {
            this.router.navigate(['/client/dashboard']);
            return;
          }
          if (this.projects.length === 1) {
            this.selectProject(this.projects[0]);
            return;
          }
          this.isLoading = false;
          this.cdr.detectChanges();
        },
        error: () => {
          this.loadingService.hide();
          this.isLoading = false;
          this.cdr.detectChanges();
        },
      });
    }
  }

  selectProject(project: any) {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('selectedProject', JSON.stringify(project));
    }
    this.router.navigate(['/client/projects', project._id]);
  }

  getPhotoUrl(path: string | null): string {
    return path ? `${this.baseUrl}/${path.replace(/\\/g, '/')}` : '';
  }

  logout() {
    this.authServices.logout();
    this.router.navigate(['/login']);
  }
}
