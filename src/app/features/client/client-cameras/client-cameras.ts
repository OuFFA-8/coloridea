import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit,
  PLATFORM_ID,
  inject,
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterLink } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { CamerasService } from '../../../core/services/cameras-service/cameras-service';
import { environment } from '../../../../environments/environment';

interface Camera {
  _id: string;
  name: string;
  lastPic?: string;
  cameraVideo?: string;
  driveVideo?: string;
  video?: string;
}

export interface LayoutOption {
  id: string;
  label: string;
  maxCams: number;
  cols: number;
  rows: number;
  featured?: boolean;
}

@Component({
  selector: 'app-client-cameras',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './client-cameras.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ClientCameras implements OnInit, OnDestroy {
  private camerasService = inject(CamerasService);
  private cdr = inject(ChangeDetectorRef);
  private platformId = inject(PLATFORM_ID);
  private sanitizer = inject(DomSanitizer);

  readonly baseUrl = environment.baseUrl;

  cameras: Camera[] = [];
  isLoading = true;
  layoutId = '4';
  showVideo = false;
  promoVideoUrl = '';
  safePromoUrl: SafeResourceUrl | string = '';
  promoIsFile = true;
  refreshTs = 0;
  showLayoutPicker = false;

  private refreshInterval?: ReturnType<typeof setInterval>;
  private promoInterval?: ReturnType<typeof setInterval>;
  private iframePromoTimeout?: ReturnType<typeof setTimeout>;

  readonly layouts: LayoutOption[] = [
    { id: '1',    label: '1',   maxCams: 1,  cols: 1, rows: 1 },
    { id: '2h',   label: '2',   maxCams: 2,  cols: 2, rows: 1 },
    { id: '4',    label: '4',   maxCams: 4,  cols: 2, rows: 2 },
    { id: '6',    label: '6',   maxCams: 6,  cols: 3, rows: 2 },
    { id: '9',    label: '9',   maxCams: 9,  cols: 3, rows: 3 },
    { id: '12',   label: '12',  maxCams: 12, cols: 4, rows: 3 },
    { id: 'f1+1', label: '1+1', maxCams: 2,  cols: 2, rows: 1, featured: true },
    { id: 'f1+2', label: '1+2', maxCams: 3,  cols: 2, rows: 2, featured: true },
    { id: 'f1+4', label: '1+4', maxCams: 5,  cols: 2, rows: 4, featured: true },
  ];

  ngOnInit() {
    if (!isPlatformBrowser(this.platformId)) return;

    const saved = localStorage.getItem('ci-camera-layout');
    if (saved) this.layoutId = saved;

    this.refreshTs = Date.now();
    this.loadCameras();

    this.refreshInterval = setInterval(() => {
      this.refreshTs = Date.now();
      this.cdr.detectChanges();
    }, 60_000);

    this.promoInterval = setInterval(() => {
      this.triggerPromo();
    }, 60_000);
  }

  ngOnDestroy() {
    clearInterval(this.refreshInterval);
    clearInterval(this.promoInterval);
    clearTimeout(this.iframePromoTimeout);
  }

  loadCameras() {
    this.camerasService.getMyCameras().subscribe({
      next: (res) => {
        this.cameras = res.data || [];
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.isLoading = false;
        this.cdr.detectChanges();
      },
    });
  }

  setLayout(id: string) {
    this.layoutId = id;
    localStorage.setItem('ci-camera-layout', id);
    this.showLayoutPicker = false;
    this.cdr.detectChanges();
  }

  getLastPicUrl(camera: Camera): string {
    if (!camera.lastPic) return '';
    const sep = camera.lastPic.includes('?') ? '&' : '?';
    return `${camera.lastPic}${sep}_t=${this.refreshTs}`;
  }

  getGridTemplateColumns(): string {
    switch (this.layoutId) {
      case '1':    return '1fr';
      case '2h':   return '1fr 1fr';
      case '4':    return '1fr 1fr';
      case '6':    return '1fr 1fr 1fr';
      case '9':    return '1fr 1fr 1fr';
      case '12':   return '1fr 1fr 1fr 1fr';
      case 'f1+1': return '3fr 1fr';
      case 'f1+2': return '3fr 1fr';
      case 'f1+4': return '3fr 1fr';
      default:     return '1fr 1fr';
    }
  }

  getGridTemplateRows(): string | null {
    switch (this.layoutId) {
      case 'f1+2': return '1fr 1fr';
      case 'f1+4': return '1fr 1fr 1fr 1fr';
      default:     return null;
    }
  }

  getCellGridRow(index: number): string | null {
    if (index !== 0) return null;
    switch (this.layoutId) {
      case 'f1+2': return '1 / 3';
      case 'f1+4': return '1 / 5';
      default:     return null;
    }
  }

  getDisplayedCameras(): Camera[] {
    const layout = this.layouts.find((l) => l.id === this.layoutId);
    return this.cameras.slice(0, layout?.maxCams ?? this.cameras.length);
  }

  getCurrentLayout(): LayoutOption | undefined {
    return this.layouts.find((l) => l.id === this.layoutId);
  }

  getFillerCount(): number {
    const layout = this.getCurrentLayout();
    if (!layout) return 0;
    return Math.max(0, layout.maxCams - this.getDisplayedCameras().length);
  }

  range(n: number): number[] {
    return Array.from({ length: Math.max(0, n) }, (_, i) => i);
  }

  triggerPromo() {
    const cam = this.cameras.find((c) => c.video || c.cameraVideo || c.driveVideo);
    if (!cam) return;

    if (cam.video) {
      this.promoVideoUrl = `${this.baseUrl}/${cam.video.replace(/\\/g, '/')}`;
      this.promoIsFile = true;
    } else {
      const url = cam.cameraVideo || cam.driveVideo || '';
      if (!url) return;
      this.promoVideoUrl = url;
      this.safePromoUrl = this.sanitizer.bypassSecurityTrustResourceUrl(url);
      this.promoIsFile = false;
      this.iframePromoTimeout = setTimeout(() => this.stopPromo(), 30_000);
    }

    this.showVideo = true;
    this.cdr.detectChanges();
  }

  onVideoEnded() {
    this.stopPromo();
  }

  stopPromo() {
    this.showVideo = false;
    this.promoVideoUrl = '';
    clearTimeout(this.iframePromoTimeout);
    this.cdr.detectChanges();
  }
}
