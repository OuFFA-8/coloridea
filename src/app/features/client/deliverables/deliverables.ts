import { ChangeDetectorRef, Component, inject, OnInit, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { environment } from '../../../../environments/environment';
import { AuthServices } from '../../../core/services/auth-services/auth-services';
import { ProjectsService } from '../../../core/services/projects-service/projects-service';
import { LoadingService } from '../../../core/services/loading-service/loading-service';

@Component({
  selector: 'app-deliverables',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './deliverables.html',
  styleUrl: './deliverables.css',
})
export class Deliverables implements OnInit {
  private platformId = inject(PLATFORM_ID);
  private cdr = inject(ChangeDetectorRef);
  private loadingService = inject(LoadingService);

  outputs: any[] = [];
  isLoading = true;
  selectedItem: any = null;
  baseUrl = environment.baseUrl;

  constructor(
    private route: ActivatedRoute,
    private projectsService: ProjectsService,
    private authServices: AuthServices,
    private sanitizer: DomSanitizer,
  ) {}

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      const projectId = this.route.parent?.snapshot.paramMap.get('id');
      const user = this.authServices.getUser();
      if (!user?._id) {
        this.isLoading = false;
        return;
      }

      this.loadingService.show('Loading deliverables...');
      this.projectsService.getUserProjects(user._id).subscribe({
        next: (res) => {
          const project = (res.data || []).find((p: any) => p._id === projectId);
          this.outputs = project?.outputs || [];
          this.isLoading = false;
          this.loadingService.hide();
          this.cdr.detectChanges();
        },
        error: () => {
          this.isLoading = false;
          this.loadingService.hide();
          this.cdr.detectChanges();
        },
      });
    }
  }

  getPhotoUrl(path: string | null): string {
    return path ? `${this.baseUrl}/${path.replace(/\\/g, '/')}` : '';
  }
  getSafeUrl(url: string): SafeResourceUrl {
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }
  openItem(item: any) {
    this.selectedItem = item;
  }
  closeModal() {
    this.selectedItem = null;
  }
  getOutputProgress(output: any): number {
    if (!output.numberOfItems) return 0;
    return Math.round(((output.items?.length || 0) / output.numberOfItems) * 100);
  }
}
