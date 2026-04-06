import { ChangeDetectorRef, Component, inject, OnInit, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { HttpClient } from '@angular/common/http';
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
  driveFiles: any[] = [];
  driveLoading = false;
  driveError = false;
  selectedDriveFile: any = null;

  baseUrl = environment.baseUrl;
  private apiKey = environment.googleApiKey;

  constructor(
    private route: ActivatedRoute,
    private projectsService: ProjectsService,
    private authServices: AuthServices,
    private sanitizer: DomSanitizer,
    private http: HttpClient,
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
          this.outputs = (project?.outputs || []).sort(
            (a: any, b: any) => (a.displayOrder || 0) - (b.displayOrder || 0),
          );
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

  isDriveFolder(url: string): boolean {
    return (
      !!url?.includes('drive.google.com') && (url.includes('/folders/') || url.includes('/drive/'))
    );
  }

  extractFolderId(url: string): string | null {
    const match = url.match(/\/folders\/([a-zA-Z0-9_-]+)/);
    return match ? match[1] : null;
  }

  openItem(item: any) {
    this.selectedItem = item;
    this.driveFiles = [];
    this.driveError = false;
    this.selectedDriveFile = null;
    if (item.link && this.isDriveFolder(item.link)) {
      this.loadDriveFiles(item.link);
    }
  }

  loadDriveFiles(url: string) {
    const folderId = this.extractFolderId(url);
    if (!folderId) {
      this.driveError = true;
      return;
    }
    this.driveLoading = true;
    this.cdr.detectChanges();

    const apiUrl = `https://www.googleapis.com/drive/v3/files?q='${folderId}'+in+parents&key=${this.apiKey}&fields=files(id,name,mimeType,thumbnailLink,modifiedTime,size)&orderBy=name`;
    this.http.get<any>(apiUrl).subscribe({
      next: (res) => {
        this.driveFiles = res.files || [];
        this.driveLoading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.driveLoading = false;
        this.driveError = true;
        this.cdr.detectChanges();
      },
    });
  }

  openDriveFile(file: any) {
    this.selectedDriveFile = file;
    this.cdr.detectChanges();
  }

  closeDriveFile() {
    this.selectedDriveFile = null;
    this.cdr.detectChanges();
  }

  getDriveFileEmbedUrl(file: any): SafeResourceUrl {
    return this.sanitizer.bypassSecurityTrustResourceUrl(
      `https://drive.google.com/file/d/${file.id}/preview`,
    );
  }

  getThumbnailUrl(file: any): string {
    if (file.thumbnailLink) {
      return file.thumbnailLink.replace(/=s\d+$/, '=s400');
    }
    return '';
  }

  getFileIcon(mimeType: string): string {
    if (mimeType?.includes('video')) return '🎬';
    if (mimeType?.includes('image')) return '🖼️';
    if (mimeType?.includes('pdf')) return '📄';
    if (mimeType?.includes('audio')) return '🎵';
    if (mimeType?.includes('spreadsheet')) return '📊';
    if (mimeType?.includes('document')) return '📝';
    return '📁';
  }

  formatFileSize(bytes: string): string {
    const b = parseInt(bytes);
    if (!b) return '';
    if (b < 1024 * 1024) return `${(b / 1024).toFixed(0)} KB`;
    return `${(b / 1024 / 1024).toFixed(1)} MB`;
  }

  closeModal() {
    this.selectedItem = null;
    this.driveFiles = [];
    this.selectedDriveFile = null;
  }

  getEmbedUrl(url: string): SafeResourceUrl {
    let embedUrl = url;
    if (url.includes('drive.google.com') && url.includes('/file/')) {
      embedUrl = url.replace('/view', '/preview').replace('/edit', '/preview');
    }
    if (url.includes('youtube.com/watch')) {
      const id = new URL(url).searchParams.get('v');
      if (id) embedUrl = `https://www.youtube.com/embed/${id}`;
    }
    if (url.includes('youtu.be/')) {
      const id = url.split('youtu.be/')[1]?.split('?')[0];
      if (id) embedUrl = `https://www.youtube.com/embed/${id}`;
    }
    return this.sanitizer.bypassSecurityTrustResourceUrl(embedUrl);
  }

  getOutputProgress(output: any): number {
    if (!output.numberOfItems) return 0;
    return Math.round(((output.items?.length || 0) / output.numberOfItems) * 100);
  }
}
