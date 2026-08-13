import { ChangeDetectionStrategy, ChangeDetectorRef, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-timelapse-viewer',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './timelapse-viewer.html',
  styleUrl: './timelapse-viewer.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TimelapseViewer {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private sanitizer = inject(DomSanitizer);
  private cdr = inject(ChangeDetectorRef);

  title = '';
  isLoading = true;
  hasError = false;
  safeUrl: SafeResourceUrl | null = null;
  private rawUrl = '';
  private projectId: string | null = null;

  constructor() {
    const params = this.route.snapshot.queryParamMap;
    const url = params.get('url');
    this.title = params.get('name') || 'Timelapse';
    this.projectId = params.get('projectId');

    if (!url) {
      this.hasError = true;
      this.isLoading = false;
      return;
    }

    this.rawUrl = url;
    this.safeUrl = this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }

  onIframeLoad() {
    this.isLoading = false;
    this.cdr.detectChanges();
  }

  onIframeError() {
    this.isLoading = false;
    this.hasError = true;
    this.cdr.detectChanges();
  }

  openExternal() {
    if (this.rawUrl) {
      window.open(this.rawUrl, '_blank');
    }
  }

  goBack() {
    if (this.projectId) {
      this.router.navigate(['/client/projects', this.projectId, 'deliverables']);
    } else {
      window.history.back();
    }
  }
}