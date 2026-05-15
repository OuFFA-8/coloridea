import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnInit,
  PLATFORM_ID,
  inject,
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { firstValueFrom } from 'rxjs';
import { CamerasService } from '../../../core/services/cameras-service/cameras-service';
import { AdVideoService } from '../../../core/services/ad-video-service/ad-video-service';
import { UsersService } from '../../../core/services/users-service/users-service';
import { AuthServices } from '../../../core/services/auth-services/auth-services';
import { AlertService } from '../../../core/services/alert-service/alert-service';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-client-settings',
  imports: [CommonModule, ReactiveFormsModule, FormsModule, TranslateModule],
  templateUrl: './client-settings.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ClientSettings implements OnInit {
  private cdr = inject(ChangeDetectorRef);
  private platformId = inject(PLATFORM_ID);
  private camerasService = inject(CamerasService);
  private adVideoService = inject(AdVideoService);
  private usersService = inject(UsersService);
  private authServices = inject(AuthServices);
  private alert = inject(AlertService);
  private fb = inject(FormBuilder);

  readonly baseUrl = environment.baseUrl;

  // Cameras
  cameras: any[] = [];
  isLoadingCameras = true;
  showCameraModal = false;
  editingCamera: any = null;
  isSavingCamera = false;
  cameraForm: FormGroup;

  // Ad Videos
  adVideos: any[] = [];
  isLoadingAdVideos = true;
  showAdVideoModal = false;
  isSavingAdVideo = false;
  adVideoInputType: 'file' | 'link' = 'file';
  adVideoFile: File | null = null;
  adVideoLink = '';

  // Display Duration (for ad videos)
  editDisplayDuration = 60;
  isUpdatingDuration = false;

  constructor() {
    this.cameraForm = this.fb.group({
      name: ['', Validators.required],
      lastPic: [''],
      cameraVideo: [''],
      displayDuration: [60, [Validators.required, Validators.min(1)]],
    });
  }

  async ngOnInit() {
    if (!isPlatformBrowser(this.platformId)) return;
    const user = this.authServices.getUser();
    this.editDisplayDuration = user?.displayDuration ?? 60;
    await Promise.all([this.loadCameras(), this.loadAdVideos()]);
  }

  async loadCameras() {
    this.isLoadingCameras = true;
    try {
      const res = await firstValueFrom(this.camerasService.getMyCameras());
      this.cameras = res.data || [];
    } catch {}
    this.isLoadingCameras = false;
    this.cdr.detectChanges();
  }

  async loadAdVideos() {
    this.isLoadingAdVideos = true;
    try {
      const res = await firstValueFrom(this.adVideoService.getMyAdVideos());
      this.adVideos = res.data || [];
    } catch {}
    this.isLoadingAdVideos = false;
    this.cdr.detectChanges();
  }

  // ── Cameras ──────────────────────────────────────────────────────────────────

  toggleCameraModal(camera?: any) {
    this.showCameraModal = !this.showCameraModal;
    if (this.showCameraModal) {
      this.editingCamera = camera || null;
      if (camera) {
        this.cameraForm.patchValue({
          name: camera.name,
          lastPic: camera.lastPic || '',
          cameraVideo: camera.cameraVideo || '',
          displayDuration: camera.displayDuration ?? 60,
        });
      } else {
        this.cameraForm.reset({ displayDuration: 60 });
      }
    } else {
      this.editingCamera = null;
    }
    this.cdr.detectChanges();
  }

  saveCamera() {
    if (this.cameraForm.invalid) {
      this.cameraForm.markAllAsTouched();
      return;
    }
    this.isSavingCamera = true;
    const val = this.cameraForm.value;
    const formData = new FormData();
    formData.append('name', val.name.trim());
    formData.append('displayDuration', String(val.displayDuration));
    if (val.lastPic?.trim()) formData.append('lastPic', val.lastPic.trim());
    if (val.cameraVideo?.trim()) formData.append('cameraVideo', val.cameraVideo.trim());

    if (!this.editingCamera) {
      const user = this.authServices.getUser();
      if (user?._id) formData.append('user', user._id);
    }

    const request = this.editingCamera
      ? this.camerasService.updateMyCamera(this.editingCamera._id, formData)
      : this.camerasService.createCamera(formData);

    request.subscribe({
      next: (res: any) => {
        this.isSavingCamera = false;
        if (this.editingCamera) {
          this.cameras = this.cameras.map((c) =>
            c._id === this.editingCamera._id ? res.data : c,
          );
          this.alert.success('تم تحديث الكاميرا بنجاح');
        } else {
          this.cameras = [...this.cameras, res.data];
          this.alert.success('تم إضافة الكاميرا بنجاح');
        }
        this.toggleCameraModal();
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        this.isSavingCamera = false;
        this.alert.error(err.error?.message || 'فشل حفظ الكاميرا');
        this.cdr.detectChanges();
      },
    });
  }

  deleteCamera(id: string) {
    this.alert.confirm('حذف هذه الكاميرا؟').then((result: any) => {
      if (result.isConfirmed) {
        this.camerasService.deleteCamera(id).subscribe({
          next: () => {
            this.cameras = this.cameras.filter((c) => c._id !== id);
            this.alert.success('تم حذف الكاميرا');
            this.cdr.detectChanges();
          },
          error: (err: any) => {
            this.alert.error(err.error?.message || 'فشل الحذف');
          },
        });
      }
    });
  }

  // ── Ad Videos ────────────────────────────────────────────────────────────────

  toggleAdVideoModal() {
    this.showAdVideoModal = !this.showAdVideoModal;
    if (this.showAdVideoModal) {
      this.adVideoInputType = 'file';
      this.adVideoFile = null;
      this.adVideoLink = '';
    }
    this.cdr.detectChanges();
  }

  onAdVideoFileSelected(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    this.adVideoFile = file;
    this.cdr.detectChanges();
  }

  saveAdVideo() {
    if (this.adVideoInputType === 'file' && !this.adVideoFile) {
      this.alert.error('اختر ملف فيديو');
      return;
    }
    if (this.adVideoInputType === 'link' && !this.adVideoLink.trim()) {
      this.alert.error('أدخل رابط الفيديو');
      return;
    }
    this.isSavingAdVideo = true;
    const formData = new FormData();
    if (this.adVideoInputType === 'file' && this.adVideoFile) {
      formData.append('video', this.adVideoFile);
    } else {
      formData.append('driveVideo', this.adVideoLink.trim());
    }

    this.adVideoService.createMyAdVideo(formData).subscribe({
      next: (res: any) => {
        this.isSavingAdVideo = false;
        this.adVideos = [...this.adVideos, res.data];
        this.toggleAdVideoModal();
        this.alert.success('تم إضافة الفيديو بنجاح');
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        this.isSavingAdVideo = false;
        this.alert.error(err.error?.message || 'فشل رفع الفيديو');
        this.cdr.detectChanges();
      },
    });
  }

  deleteAdVideo(id: string) {
    this.alert.confirm('حذف هذا الفيديو؟').then((result: any) => {
      if (result.isConfirmed) {
        this.adVideoService.deleteMyAdVideo(id).subscribe({
          next: () => {
            this.adVideos = this.adVideos.filter((v) => v._id !== id);
            this.alert.success('تم حذف الفيديو');
            this.cdr.detectChanges();
          },
          error: (err: any) => {
            this.alert.error(err.error?.message || 'فشل الحذف');
          },
        });
      }
    });
  }

  // ── Display Duration ──────────────────────────────────────────────────────────

  updateDisplayDuration() {
    if (!this.editDisplayDuration || this.editDisplayDuration < 1) return;
    this.isUpdatingDuration = true;
    this.usersService.updateMyDisplayDuration(this.editDisplayDuration).subscribe({
      next: () => {
        this.isUpdatingDuration = false;
        this.alert.success('تم تحديث مدة العرض');
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        this.isUpdatingDuration = false;
        this.alert.error(err.error?.message || 'فشل التحديث');
        this.cdr.detectChanges();
      },
    });
  }
}
