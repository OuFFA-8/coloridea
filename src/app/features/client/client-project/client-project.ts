import { Project } from './../../../core/models/project';
import { ChangeDetectorRef, Component, inject, OnInit, PLATFORM_ID } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { environment } from '../../../../environments/environment';
import { AuthServices } from '../../../core/services/auth-services/auth-services';
import { ProjectsService } from '../../../core/services/projects-service/projects-service';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-client-project',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './client-project.html',
  styleUrl: './client-project.css',
})
export class ClientProject implements OnInit {
  private platformId = inject(PLATFORM_ID);
  private cdr = inject(ChangeDetectorRef);

  allProjects: any[] = [];
  filteredProjects: any[] = [];
  currentFilter = 'All';
  isLoading = true;
  baseUrl = environment.baseUrl;

  constructor(
    private authServices: AuthServices,
    private projectsService: ProjectsService,
    private router: Router,
  ) {}

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      const user = this.authServices.getUser();
      if (user?._id) {
        this.projectsService.getUserProjects(user._id).subscribe({
          next: (res) => {
            this.allProjects = res.data || [];
            this.filteredProjects = [...this.allProjects];
            this.isLoading = false;
            this.cdr.detectChanges();
          },
          error: () => {
            this.isLoading = false;
            this.cdr.detectChanges();
          },
        });
      } else {
        this.isLoading = false;
      }
    }
  }

  setFilter(status: string) {
    this.currentFilter = status;
    this.filteredProjects =
      status === 'All'
        ? [...this.allProjects]
        : this.allProjects.filter((p) => p.status?.toLowerCase() === status.toLowerCase());
  }

  getPhotoUrl(path: string | null): string {
    return path ? `${this.baseUrl}/${path.replace(/\\/g, '/')}` : '';
  }

  openDetails(id: string) {
    this.router.navigate(['/client/projects', id]);
  }

  getOutputsProgress(project: any): number {
    if (!project.outputs?.length) return 0;
    const total = project.outputs.reduce((s: number, o: any) => s + (o.numberOfItems || 0), 0);
    const done = project.outputs.reduce((s: number, o: any) => s + (o.items?.length || 0), 0);
    return total ? Math.round((done / total) * 100) : 0;
  }
}
