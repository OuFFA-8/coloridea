import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  NgZone,
  OnDestroy,
  OnInit,
  PLATFORM_ID,
  inject,
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { firstValueFrom } from 'rxjs';
import { CamerasService } from '../../../core/services/cameras-service/cameras-service';
import { AdVideoService } from '../../../core/services/ad-video-service/ad-video-service';
import { AuthServices } from '../../../core/services/auth-services/auth-services';
import { environment } from '../../../../environments/environment';
import { AutoplayVideoDirective } from './autoplay-video.directive';

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
  imports: [CommonModule, TranslateModule, AutoplayVideoDirective],
  templateUrl: './client-cameras.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ClientCameras implements OnInit, OnDestroy {
  private router = inject(Router);
  private camerasService = inject(CamerasService);
  private adVideoService = inject(AdVideoService);
  private authServices = inject(AuthServices);
  private cdr = inject(ChangeDetectorRef);
  private ngZone = inject(NgZone);
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

  // Slot assignments: slot index → camera _id
  slotAssignments = new Map<number, string>();

  // Right-click context menu
  contextMenu = { visible: false, x: 0, y: 0, slotIndex: -1 };

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
  private adYoutubeHandler?: (e: MessageEvent) => void;
  private adEndFallbackTimer?: ReturnType<typeof setTimeout>;

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

    const savedSlots = localStorage.getItem('ci-camera-slots');
    if (savedSlots) {
      const obj = JSON.parse(savedSlots) as Record<string, string>;
      Object.entries(obj).forEach(([k, v]) => this.slotAssignments.set(Number(k), v));
    }

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
    clearTimeout(this.adEndFallbackTimer);
    this.iframeCellTimeouts.forEach((t) => clearTimeout(t));
    this.nextPlayTimers.forEach((t) => clearTimeout(t));
    this.removeYoutubeHandler();
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
    // Local files (relative paths or our server URL) → <video> element.
    // External URLs (YouTube, Drive, tikee.io, etc.) → <iframe>.
    const isLocalFile = url.startsWith(this.baseUrl) || !url.includes('://');
    this.cellIsFile.set(cam._id, isLocalFile);
    if (isLocalFile) {
      this.cellVideoUrls.set(cam._id, url.startsWith('http') ? url : `${this.baseUrl}/${url.replace(/\\/g, '/')}`);
    } else {
      const ytId = this.extractYoutubeId(url);
      const isDrive = url.includes('drive.google.com');
      let embedUrl: string;
      if (ytId) {
        embedUrl = `https://www.youtube.com/embed/${ytId}?autoplay=1&mute=1&controls=0&rel=0&playsinline=1`;
      } else if (isDrive) {
        embedUrl = url.replace('/view', '/preview').replace('/edit', '/preview');
        const sep = embedUrl.includes('?') ? '&' : '?';
        embedUrl += `${sep}autoplay=1&mute=1`;
      } else {
        // Other external services (tikee.io, etc.) — use URL as-is in iframe
        embedUrl = url;
      }
      this.cellIframeUrls.set(cam._id, this.sanitizer.bypassSecurityTrustResourceUrl(embedUrl));
    }
    this.playingCamIds.add(cam._id);
    this.cdr.detectChanges();

    // All video types: force-stop after 30 seconds and return to camera snapshot
    clearTimeout(this.iframeCellTimeouts.get(cam._id));
    this.iframeCellTimeouts.set(cam._id, setTimeout(() => this.stopCellVideo(cam._id), 30_000));
  }

  stopCellVideo(camId: string) {
    this.playingCamIds.delete(camId);
    this.cellVideoUrls.delete(camId);
    this.cellIframeUrls.delete(camId);
    this.cellIsFile.delete(camId);
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
    // Universal 60-second cap — applies to all ad types
    clearTimeout(this.adEndFallbackTimer);
    this.adEndFallbackTimer = setTimeout(() => {
      this.ngZone.run(() => this.stopAdVideo());
    }, 60_000);

    if (vid.video) {
      this.adVideoFileUrl = `${this.baseUrl}/${vid.video.replace(/\\/g, '/')}`;
      this.adIsFile = true;
    } else if (vid.driveVideo) {
      const url = vid.driveVideo;
      const ytId = this.extractYoutubeId(url);

      if (ytId) {
        // YouTube: official JS API → postMessage state 0 = ended
        const embed = `https://www.youtube.com/embed/${ytId}?enablejsapi=1&autoplay=1&mute=1&rel=0`;
        this.safeAdVideoUrl = this.sanitizer.bypassSecurityTrustResourceUrl(embed);
      } else {
        // Google Drive (and any other link): preview iframe with enablejsapi=1
        let embedUrl = url.replace('/view', '/preview').replace('/edit', '/preview');
        const sep = embedUrl.includes('?') ? '&' : '?';
        embedUrl += `${sep}autoplay=1&rm=minimal&enablejsapi=1`;
        this.safeAdVideoUrl = this.sanitizer.bypassSecurityTrustResourceUrl(embedUrl);
      }
      this.adIsFile = false;
      this.listenForYoutubeEnd();
    } else {
      clearTimeout(this.adEndFallbackTimer);
      return;
    }
    this.showAdVideo = true;
    this.cdr.detectChanges();
  }

  onAdVideoEnded() {
    this.stopAdVideo();
  }

  onAdVideoError() {
    this.stopAdVideo();
  }

  // Sends the YouTube iframe API init message so the player starts posting events.
  // Also sets a 3-minute fallback for Drive embeds whose player events don't reach our window.
  onAdIframeLoad(event: Event) {
    const iframe = event.target as HTMLIFrameElement;
    iframe.contentWindow?.postMessage(JSON.stringify({ event: 'listening', id: 1 }), '*');

    // Drive's preview player wraps YouTube inside a nested iframe — postMessage events
    // from the inner player go to Drive's window, not ours, so state/infoDelivery events
    // never arrive. Use a time-based fallback that fires from the moment the iframe loads.
    clearTimeout(this.iframeAdTimeout);
    this.iframeAdTimeout = setTimeout(() => {
      this.ngZone.run(() => this.stopAdVideo());
    }, 60_000);
  }

  private listenForYoutubeEnd() {
    this.removeYoutubeHandler();
    clearTimeout(this.adEndFallbackTimer);
    let fallbackSet = false;
    let lastKnownDuration = 0;
    let lastKnownCurrentTime = 0;

    // 60-second cap already set in playAdVideo; don't override it here

    this.adYoutubeHandler = (e: MessageEvent) => {
      try {
        const msg = typeof e.data === 'string' ? JSON.parse(e.data) : e.data;

        if (msg?.event === 'onStateChange') {
          // state 0 = ended
          if (msg?.info === 0) {
            clearTimeout(this.adEndFallbackTimer);
            this.ngZone.run(() => this.stopAdVideo());
            return;
          }
          // state 2 = paused — Drive pauses at the end instead of firing ended
          if (msg?.info === 2 && lastKnownDuration > 0 && lastKnownCurrentTime >= lastKnownDuration - 3) {
            clearTimeout(this.adEndFallbackTimer);
            this.ngZone.run(() => this.stopAdVideo());
            return;
          }
        }

        if (msg?.event === 'infoDelivery') {
          const info = msg.info as { duration?: number; currentTime?: number } | null;
          if (info?.duration && info.duration > 0 && info.currentTime != null) {
            lastKnownDuration = info.duration;
            lastKnownCurrentTime = info.currentTime;

            // Detect near-end directly from currentTime
            if (info.currentTime >= info.duration - 1) {
              clearTimeout(this.adEndFallbackTimer);
              this.ngZone.run(() => this.stopAdVideo());
              return;
            }

            // Replace the hard safety timer with a precise duration-based one (set once)
            if (!fallbackSet) {
              clearTimeout(this.adEndFallbackTimer);
              const remaining = Math.max(info.duration - info.currentTime + 2, 2);
              this.adEndFallbackTimer = setTimeout(() => {
                this.ngZone.run(() => this.stopAdVideo());
              }, remaining * 1_000);
              fallbackSet = true;
            }
          }
        }
      } catch { /* not JSON */ }
    };
    window.addEventListener('message', this.adYoutubeHandler);
  }

  private removeYoutubeHandler() {
    if (this.adYoutubeHandler) {
      window.removeEventListener('message', this.adYoutubeHandler);
      this.adYoutubeHandler = undefined;
    }
  }

  private extractYoutubeId(url: string): string | null {
    const patterns = [
      /youtube\.com\/watch\?v=([^&]+)/,
      /youtu\.be\/([^?]+)/,
      /youtube\.com\/embed\/([^?/]+)/,
    ];
    for (const p of patterns) {
      const m = url.match(p);
      if (m) return m[1];
    }
    return null;
  }

  stopAdVideo() {
    this.removeYoutubeHandler();
    clearTimeout(this.adEndFallbackTimer);
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

  getSlotsCount(): number {
    return this.getCurrentLayout()?.maxCams ?? 0;
  }

  getCameraForSlot(slotIndex: number): Camera | null {
    const camId = this.slotAssignments.get(slotIndex);
    if (camId) return this.cameras.find((c) => c._id === camId) || null;
    return this.cameras[slotIndex] || null;
  }

  onCellRightClick(event: MouseEvent, slotIndex: number) {
    event.preventDefault();
    this.contextMenu = { visible: true, x: event.clientX, y: event.clientY, slotIndex };
    this.cdr.detectChanges();
  }

  assignCameraToSlot(cameraId: string) {
    this.slotAssignments.set(this.contextMenu.slotIndex, cameraId);
    const obj: Record<string, string> = {};
    this.slotAssignments.forEach((v, k) => { obj[k] = v; });
    localStorage.setItem('ci-camera-slots', JSON.stringify(obj));
    this.closeContextMenu();
  }

  closeContextMenu() {
    this.contextMenu = { ...this.contextMenu, visible: false };
    this.cdr.detectChanges();
  }

  goBack() {
    if (this.authServices.isAdmin()) {
      this.router.navigate(['/admin/clients']);
    } else {
      const stored = localStorage.getItem('selectedProject');
      const projectId = stored ? JSON.parse(stored)?._id : null;
      if (projectId) {
        this.router.navigate(['/client/projects', projectId]);
      } else {
        this.router.navigate(['/select-project']);
      }
    }
  }

  getFileUrl(path: string): string {
    return `${this.baseUrl}/${path.replace(/\\/g, '/')}`;
  }
}
