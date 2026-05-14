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
import { firstValueFrom } from 'rxjs';
import { CamerasService } from '../../../core/services/cameras-service/cameras-service';
import { AdVideoService } from '../../../core/services/ad-video-service/ad-video-service';
import { AuthServices } from '../../../core/services/auth-services/auth-services';
import { environment } from '../../../../environments/environment';

interface Camera {
  _id: string;
  name: string;
  lastPic?: string;
  lastPicUrl?: string;
  lastPicDate?: string;
  cameraVideo?: string;
  displayDuration?: number;
  isActive?: boolean;
}

interface AdVideo {
  _id: string;
  video?: string;
  driveVideo?: string;
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
  private adVideoService = inject(AdVideoService);
  private authServices = inject(AuthServices);
  private cdr = inject(ChangeDetectorRef);
  private platformId = inject(PLATFORM_ID);
  private sanitizer = inject(DomSanitizer);

  readonly baseUrl = environment.baseUrl;

  cameras: Camera[] = [];
  adVideos: AdVideo[] = [];
  isLoading = true;
  layoutId = '4';
  showLayoutPicker = false;
  refreshTs = 0;

  // Per-camera in-cell timelapse (each camera independent)
  playingCamIds = new Set<string>();
  cellVideoUrls = new Map<string, string>();
  cellIframeUrls = new Map<string, SafeResourceUrl>();
  cellIsFile = new Map<string, boolean>();
  private iframeCellTimeouts = new Map<string, ReturnType<typeof setTimeout>>();

  // Expanded camera overlay
  expandedCamId: string | null = null;

  // Ad video fullscreen
  showAdVideo = false;
  adVideoFileUrl = '';
  safeAdVideoUrl: SafeResourceUrl | string = '';
  adIsFile = false;
  currentAdVideoIndex = 0;
  userDisplayDuration = 60;

  private refreshInterval?: ReturnType<typeof setInterval>;
  private adVideoTimeout?: ReturnType<typeof setTimeout>;
  private iframeAdTimeout?: ReturnType<typeof setTimeout>;
  private iframeCellTimeout?: ReturnType<typeof setTimeout>;
  private nextPlayTimers = new Map<string, ReturnType<typeof setTimeout>>();

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

  async ngOnInit() {
    if (!isPlatformBrowser(this.platformId)) return;

    const saved = localStorage.getItem('ci-camera-layout');
    if (saved) this.layoutId = saved;

    const storedUser = this.authServices.getUser();
    this.userDisplayDuration = storedUser?.displayDuration ?? 60;

    try {
      const adRes = await firstValueFrom(this.adVideoService.getMyAdVideos());
      this.adVideos = adRes.data || [];
    } catch {
      // ad videos unavailable
    }

    await this.loadCameras();

    this.refreshInterval = setInterval(async () => {
      await this.loadCameras();
    }, 60_000);

    if (this.adVideos.length > 0) {
      this.adVideoTimeout = setTimeout(() => {
        this.showNextAdVideo();
      }, this.userDisplayDuration * 1_000);
    }
  }

  ngOnDestroy() {
    clearInterval(this.refreshInterval);
    clearTimeout(this.adVideoTimeout);
    clearTimeout(this.iframeAdTimeout);
    this.iframeCellTimeouts.forEach((t) => clearTimeout(t));
    this.nextPlayTimers.forEach((t) => clearTimeout(t));
  }

  async loadCameras() {
    try {
      const res = await firstValueFrom(this.camerasService.getMyCameras());
      this.cameras = (res.data || []).filter((c: Camera) => c.isActive !== false);
      this.isLoading = false;
      this.scheduleCameraTimelapse();
      this.cdr.detectChanges();
    } catch {
      this.isLoading = false;
      this.cdr.detectChanges();
    }
  }

  scheduleCameraTimelapse() {
    for (const cam of this.cameras) {
      if (!cam.cameraVideo) continue;
      if (this.playingCamIds.has(cam._id) || this.nextPlayTimers.has(cam._id)) continue;
      const delay = (cam.displayDuration || 30) * 1_000;
      const t = setTimeout(() => this.playCellVideo(cam), delay);
      this.nextPlayTimers.set(cam._id, t);
    }
  }

  getLastPicUrl(camera: Camera): string {
    return camera.lastPicUrl ?? camera.lastPic ?? '';
  }

  // ── Per-camera timelapse ────────────────────────────────────────────────────

  playCellVideo(cam: Camera) {
    if (!cam.cameraVideo || this.showAdVideo) return;
    clearTimeout(this.nextPlayTimers.get(cam._id));
    this.nextPlayTimers.delete(cam._id);
    const url = cam.cameraVideo;
    const isFile = url.startsWith(this.baseUrl) || !url.includes('://');
    this.cellIsFile.set(cam._id, isFile);
    if (isFile) {
      this.cellVideoUrls.set(cam._id, url.startsWith('http') ? url : `${this.baseUrl}/${url.replace(/\\/g, '/')}`);
    } else {
      this.cellIframeUrls.set(cam._id, this.sanitizer.bypassSecurityTrustResourceUrl(url));
    }
    this.playingCamIds.add(cam._id);
    this.cdr.detectChanges();

    if (!isFile) {
      clearTimeout(this.iframeCellTimeouts.get(cam._id));
      this.iframeCellTimeouts.set(cam._id, setTimeout(() => this.stopCellVideo(cam._id), 30_000));
    }
  }

  stopCellVideo(camId: string) {
    this.playingCamIds.delete(camId);
    this.cellVideoUrls.delete(camId);
    this.cellIframeUrls.delete(camId);
    clearTimeout(this.iframeCellTimeouts.get(camId));
    this.iframeCellTimeouts.delete(camId);
    this.cdr.detectChanges();

    const cam = this.cameras.find((c) => c._id === camId);
    if (cam?.cameraVideo) {
      const delay = (cam.displayDuration || 30) * 1_000;
      const t = setTimeout(() => this.playCellVideo(cam), delay);
      this.nextPlayTimers.set(camId, t);
    }
  }

  // ── Expand camera ───────────────────────────────────────────────────────────

  toggleExpand(camId: string) {
    this.expandedCamId = this.expandedCamId === camId ? null : camId;
    this.cdr.detectChanges();
  }

  getExpandedCamera(): Camera | undefined {
    return this.cameras.find((c) => c._id === this.expandedCamId);
  }

  // ── Ad videos ───────────────────────────────────────────────────────────────

  showNextAdVideo() {
    if (this.adVideos.length === 0) return;
    const vid = this.adVideos[this.currentAdVideoIndex % this.adVideos.length];
    this.currentAdVideoIndex = (this.currentAdVideoIndex + 1) % this.adVideos.length;
    this.playAdVideo(vid);
  }

  playAdVideo(vid: AdVideo) {
    if (vid.video) {
      this.adVideoFileUrl = `${this.baseUrl}/${vid.video.replace(/\\/g, '/')}`;
      this.adIsFile = true;
    } else if (vid.driveVideo) {
      let embedUrl = vid.driveVideo
        .replace('/view', '/preview')
        .replace('/edit', '/preview');
      const sep = embedUrl.includes('?') ? '&' : '?';
      embedUrl += `${sep}autoplay=1&rm=minimal`;
      this.safeAdVideoUrl = this.sanitizer.bypassSecurityTrustResourceUrl(embedUrl);
      this.adIsFile = false;
      this.iframeAdTimeout = setTimeout(() => this.stopAdVideo(), 30_000);
    } else {
      return;
    }
    this.showAdVideo = true;
    this.cdr.detectChanges();
  }

  onAdVideoEnded() {
    this.stopAdVideo();
  }

  stopAdVideo() {
    this.showAdVideo = false;
    this.adVideoFileUrl = '';
    clearTimeout(this.iframeAdTimeout);
    clearTimeout(this.adVideoTimeout);
    this.cdr.detectChanges();

    if (this.adVideos.length > 0) {
      this.adVideoTimeout = setTimeout(() => {
        this.showNextAdVideo();
      }, this.userDisplayDuration * 1_000);
    }
  }

  // ── Layout ──────────────────────────────────────────────────────────────────

  setLayout(id: string) {
    this.layoutId = id;
    localStorage.setItem('ci-camera-layout', id);
    this.showLayoutPicker = false;
    this.cdr.detectChanges();
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

  getFileUrl(path: string): string {
    return `${this.baseUrl}/${path.replace(/\\/g, '/')}`;
  }
}
