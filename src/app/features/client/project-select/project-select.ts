import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, PLATFORM_ID, inject } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { environment } from '../../../../environments/environment';
import { AuthServices } from '../../../core/services/auth-services/auth-services';
import { ProjectsService } from '../../../core/services/projects-service/projects-service';
import { ManagersService } from '../../../core/services/managers-service/managers-service';
import { LoadingService } from '../../../core/services/loading-service/loading-service';
import { Header } from '../../../shared/components/header/header';

@Component({
  selector: 'app-project-select',
  imports: [CommonModule, TranslateModule, Header],
  templateUrl: './project-select.html',
  styleUrl: './project-select.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProjectSelect implements OnInit {
  private platformId = inject(PLATFORM_ID);
  private cdr = inject(ChangeDetectorRef);
  private loadingService = inject(LoadingService);
  private authServices = inject(AuthServices);
  private projectsService = inject(ProjectsService);
  private managersService = inject(ManagersService);
  private router = inject(Router);

  private managerProjectsMap: Record<string, string[]> = {};

  user: any = null;
  projects: any[] = [];
  isLoading = true;
  baseUrl = environment.baseUrl;

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.user = this.authServices.getUser();
      if (!this.user?._id) {
        this.router.navigate(['/login']);
        return;
      }

      this.loadingService.show('Loading...');
      const role = this.authServices.getRole();

      if (role === 'manager') {
        this.managersService.getMyProjects().subscribe({
          next: (res) => {
            const managerProjects = res.data || [];
            this.managerProjectsMap = {};
            this.projects = managerProjects.map((mp: any) => {
              this.managerProjectsMap[mp.project._id] = mp.permissions || [];
              return mp.project;
            });
            this.loadingService.hide();
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
      } else {
        this.projectsService.getUserProjects(this.user._id).subscribe({
          next: (res) => {
            this.projects = res.data || [];
            this.loadingService.hide();
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
  }

  selectProject(project: any) {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('selectedProject', JSON.stringify(project));
      const permissions = this.managerProjectsMap[project._id];
      if (permissions !== undefined) {
        localStorage.setItem('managerPermissions', JSON.stringify(permissions));
      } else {
        localStorage.removeItem('managerPermissions');
      }
    }
    this.router.navigate(['/client/projects', project._id]);
  }

  getPhotoUrl(path: string | null): string {
    return path ? `${this.baseUrl}/${path.replace(/\\/g, '/')}` : '';
  }
}
