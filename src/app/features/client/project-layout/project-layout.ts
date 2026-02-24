import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ChangeDetectorRef, Component, inject, OnInit, PLATFORM_ID } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive, ActivatedRoute } from '@angular/router';
import { environment } from '../../../../environments/environment';
import { AuthServices } from '../../../core/services/auth-services/auth-services';
import { ProjectsService } from '../../../core/services/projects-service/projects-service';

@Component({
  selector: 'app-project-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './project-layout.html',
  styleUrl: './project-layout.css',
})
export class ProjectLayout implements OnInit {
  private platformId = inject(PLATFORM_ID);
  private cdr = inject(ChangeDetectorRef);

  project: any = null;
  projectId = '';
  baseUrl = environment.baseUrl;

  constructor(
    private route: ActivatedRoute,
    private projectsService: ProjectsService,
    private authServices: AuthServices,
  ) {}

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.projectId = this.route.snapshot.paramMap.get('id') || '';
      const user = this.authServices.getUser();
      if (!user?._id || !this.projectId) return;

      // نحاول نجيب الـ project من localStorage أولاً (أسرع)
      const cached = localStorage.getItem('selectedProject');
      if (cached) {
        const p = JSON.parse(cached);
        if (p._id === this.projectId) {
          this.project = p;
          this.cdr.detectChanges();
        }
      }

      // نجيب البيانات الحديثة من الـ API
      this.projectsService.getUserProjects(user._id).subscribe({
        next: (res) => {
          this.project = (res.data || []).find((p: any) => p._id === this.projectId) || null;
          if (this.project) localStorage.setItem('selectedProject', JSON.stringify(this.project));
          this.cdr.detectChanges();
        },
      });
    }
  }

  getPhotoUrl(path: string | null): string {
    if (!path) return '';
    return `${this.baseUrl}/${path.replace(/\\/g, '/')}`;
  }
}
