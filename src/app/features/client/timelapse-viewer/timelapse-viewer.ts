import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  inject,
  OnDestroy,
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { PLATFORM_ID } from '@angular/core';
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
export class TimelapseViewer implements OnDestroy {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private sanitizer = inject(DomSanitizer);
  private cdr = inject(ChangeDetectorRef);
  private platformId = inject(PLATFORM_ID);

  title = '';
  isLoading = true;
  hasError = false;
  isFullscreen = false;
  safeUrl: SafeResourceUrl | null = null;
  private projectId: string | null = null;

  constructor() {
    this.readParams();

    if (isPlatformBrowser(this.platformId)) {
      document.addEventListener('fullscreenchange', this.onFullscreenChange);
    }
  }

  private readParams() {
    const params = this.route.snapshot.queryParamMap;
    const url = params.get('url');
    this.title = params.get('name') || 'Timelapse';
    this.projectId = params.get('projectId');

    if (!url) {
      this.hasError = true;
      this.isLoading = false;
      return;
    }

    this.hasError = false;
    this.isLoading = true;
    this.safeUrl = this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }

  retry() {
    this.readParams();
    this.cdr.detectChanges();
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

  toggleFullscreen() {
    if (!isPlatformBrowser(this.platformId)) return;
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen?.().catch(() => {});
    } else {
      document.exitFullscreen?.().catch(() => {});
    }
  }

  private onFullscreenChange = () => {
    this.isFullscreen = !!document.fullscreenElement;
    this.cdr.detectChanges();
  };

  goBack() {
    if (this.projectId) {
      this.router.navigate(['/client/projects', this.projectId, 'deliverables']);
    } else {
      window.history.back();
    }
  }

  ngOnDestroy() {
    if (isPlatformBrowser(this.platformId)) {
      document.removeEventListener('fullscreenchange', this.onFullscreenChange);
    }
  }
}