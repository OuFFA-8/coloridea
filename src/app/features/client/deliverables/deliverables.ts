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

  isDriveFolder(url: string): boolean {
    return url.includes('drive.google.com/drive') || url.includes('/folders/');
  }

  getEmbedUrl(url: string): SafeResourceUrl {
    let embedUrl = url;
    // Google Drive: /file/d/ID/view → /file/d/ID/preview
    if (url.includes('drive.google.com')) {
      embedUrl = url.replace('/view', '/preview').replace('/edit', '/preview');
    }
    // YouTube: watch?v=ID → embed/ID
    if (url.includes('youtube.com/watch')) {
      const id = new URL(url).searchParams.get('v');
      if (id) embedUrl = `https://www.youtube.com/embed/${id}`;
    }
    // YouTube short: youtu.be/ID → embed/ID
    if (url.includes('youtu.be/')) {
      const id = url.split('youtu.be/')[1]?.split('?')[0];
      if (id) embedUrl = `https://www.youtube.com/embed/${id}`;
    }
    return this.sanitizer.bypassSecurityTrustResourceUrl(embedUrl);
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
