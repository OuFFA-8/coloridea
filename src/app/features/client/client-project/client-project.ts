import { Project } from './../../../core/models/project';
import { ChangeDetectorRef, Component, inject, OnInit, PLATFORM_ID } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule, isPlatformBrowser } from '@angular/common'; // مهم جداً للـ classes والـ pipes
import { environment } from '../../../../environments/environment';
import { AuthServices } from '../../../core/services/auth-services/auth-services';
import { ProjectsService } from '../../../core/services/projects-service/projects-service';

@Component({
  selector: 'app-client-project',
  standalone: true,
  imports: [CommonModule], // ضفنا CommonModule هنا
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
    if (!path) return '';
    return `${this.baseUrl}/${path.replace(/\\/g, '/')}`;
  }

  openDetails(id: string) {
    this.router.navigate(['/client/projects', id]);
  }

  getOutputsProgress(project: any): number {
    if (!project.outputs?.length) return 0;
    const totalItems = project.outputs.reduce(
      (sum: number, o: any) => sum + (o.numberOfItems || 0),
      0,
    );
    const doneItems = project.outputs.reduce(
      (sum: number, o: any) => sum + (o.items?.length || 0),
      0,
    );
    return totalItems ? Math.round((doneItems / totalItems) * 100) : 0;
  }
}
