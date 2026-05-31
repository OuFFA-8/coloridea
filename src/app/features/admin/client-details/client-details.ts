import {
  ChangeDetectorRef,
  Component,
  OnInit,
  PLATFORM_ID,
  TransferState,
  inject,
  makeStateKey,
} from '@angular/core';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import {
  FormBuilder,
  FormGroup,
  FormArray,
  Validators,
  ReactiveFormsModule,
  FormsModule,
} from '@angular/forms';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { UsersService } from '../../../core/services/users-service/users-service';
import { AlertService } from '../../../core/services/alert-service/alert-service';
import { environment } from '../../../../environments/environment';
import { ProjectsService } from '../../../core/services/projects-service/projects-service';
import { LoadingService } from '../../../core/services/loading-service/loading-service';
import { CamerasService } from '../../../core/services/cameras-service/cameras-service';
import { AdVideoService } from '../../../core/services/ad-video-service/ad-video-service';

const CLIENTS_KEY = makeStateKey<any[]>('clients');

@Component({
  selector: 'app-client-details',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, RouterLink, TranslateModule],
  templateUrl: './client-details.html',
  styleUrl: './client-details.css',
  animations: [
    trigger('collapseExpand', [
      state('open', style({ height: '*', opacity: 1, overflow: 'hidden' })),
      state('closed', style({ height: '0px', opacity: 0, overflow: 'hidden' })),
      transition('open <=> closed', animate('300ms ease-in-out')),
    ]),
  ],
})
export class ClientDetails implements OnInit {
  client: any = null;
  isLoading = true;
  isSaving = false;
  isEditing = false;
  baseUrl = environment.baseUrl;

  showProjectModal = false;
  showEditModal = false;

  projectForm: FormGroup;
  projectPhotoFile: File | null = null;
  projectPhotoPreview: string | null = null;
  projectContractFile: File | null = null;

  // Edit modal
  editData = { name: '', email: '', password: '' };
  editDisplayDuration = 60;
  isUpdatingDuration = false;
  showEditPassword = false;
  editLogoFile: File | null = null;
  editPhotoFile: File | null = null;
  editPatternFile: File | null = null;
  editLogoPreview: string | null = null;
  editPhotoPreview: string | null = null;
  editPatternPreview: string | null = null;

  // Cameras
  cameras: any[] = [];
  camerasExpanded = true;
  isLoadingCameras = false;
  showCameraModal = false;
  editingCamera: any = null;
  isSavingCamera = false;
  cameraForm: FormGroup;

  // Ad Videos
  adVideos: any[] = [];
  isLoadingAdVideos = false;
  showAdVideoModal = false;
  isSavingAdVideo = false;
  adVideoInputType: 'file' | 'link' = 'file';
  adVideoFile: File | null = null;
  adVideoLink = '';

  private cdr = inject(ChangeDetectorRef);
  private platformId = inject(PLATFORM_ID);
  private loadingService = inject(LoadingService);
  private camerasService = inject(CamerasService);
  private adVideoService = inject(AdVideoService);

  constructor(
    private route: ActivatedRoute,
    private usersService: UsersService,
    private projectsService: ProjectsService,
    private alert: AlertService,
    private transferState: TransferState,
    private fb: FormBuilder,
    private router: Router,
  ) {
    this.projectForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      description: ['', Validators.required],
      totalAmount: [null, [Validators.required, Validators.min(1)]],
      totalInstallments: [1, [Validators.required, Validators.min(1)]],
      installments: this.fb.array([]),
      agreedItems: this.fb.array([]),
    });

    this.cameraForm = this.fb.group({
      name: ['', Validators.required],
      lastPic: [''],
      cameraVideo: [''],
      displayDuration: [60, [Validators.required, Validators.min(1)]],
      isActive: [true],
    });
  }

  ngOnInit() {
    if (!isPlatformBrowser(this.platformId)) return;
    const id = this.route.snapshot.paramMap.get('id');

    if (this.transferState.hasKey(CLIENTS_KEY)) {
      const clients = this.transferState.get(CLIENTS_KEY, []);
      this.client = clients.find((c: any) => c._id === id) || null;
      if (this.client) {
        this.isLoading = false;
        this.editDisplayDuration = this.client.displayDuration ?? 60;
        this.loadCameras(this.client._id);
        this.loadAdVideos(this.client._id);
        this.cdr.detectChanges();
        return;
      }
    }

    this.loadingService.show('Loading client...');
    this.usersService.getAllUsers().subscribe({
      next: (res) => {
        this.client = res.data.find((c: any) => c._id === id) || null;
        this.isLoading = false;
        this.loadingService.hide();
        if (this.client) {
          this.editDisplayDuration = this.client.displayDuration ?? 60;
          this.loadCameras(this.client._id);
          this.loadAdVideos(this.client._id);
        }
        this.cdr.detectChanges();
        if (!this.client) this.alert.error('Client not found');
      },
      error: (err) => {
        this.isLoading = false;
        this.loadingService.hide();
        this.cdr.detectChanges();
        this.alert.error(err.error?.message || 'Failed to load client');
      },
    });
  }

  openProject(id: string) {
    this.router.navigate(['/admin/projects', id]);
  }

  getPhotoUrl(path: string | null): string {
    return path ? `${this.baseUrl}/${path.replace(/\\/g, '/')}` : '';
  }

  // ── Projects ────────────────────────────────────────────────────────────────

  get installmentsControls() {
    return (this.projectForm.get('installments') as FormArray).controls;
  }
  addInstallment() {
    (this.projectForm.get('installments') as FormArray).push(
      this.fb.group({
        amount: [null, [Validators.required, Validators.min(1)]],
        createdAt: ['', Validators.required],
      }),
    );
  }
  removeInstallment(index: number) {
    (this.projectForm.get('installments') as FormArray).removeAt(index);
  }

  get agreedItemsControls() {
    return (this.projectForm.get('agreedItems') as FormArray).controls;
  }
  addAgreedItem() {
    (this.projectForm.get('agreedItems') as FormArray).push(
      this.fb.group({
        name: ['', Validators.required],
        numberOfItems: [1, [Validators.required, Validators.min(1)]],
      }),
    );
  }
  removeAgreedItem(index: number) {
    (this.projectForm.get('agreedItems') as FormArray).removeAt(index);
  }

  onProjectContractSelected(event: any) {
    const file = event.target.files[0];
    if (file) this.projectContractFile = file;
  }

  onProjectPhotoSelected(event: any) {
    const file = event.target.files[0];
    if (!file) return;
    this.projectPhotoFile = file;
    const reader = new FileReader();
    reader.onload = () => {
      this.projectPhotoPreview = reader.result as string;
      this.cdr.detectChanges();
    };
    reader.readAsDataURL(file);
  }

  toggleProjectModal() {
    this.showProjectModal = !this.showProjectModal;
    if (this.showProjectModal) {
      this.projectForm.reset({ totalInstallments: 1 });
      (this.projectForm.get('installments') as FormArray).clear();
      (this.projectForm.get('agreedItems') as FormArray).clear();
      this.addInstallment();
      this.addAgreedItem();
      this.projectPhotoFile = null;
      this.projectPhotoPreview = null;
      this.projectContractFile = null;
    }
  }

  saveProject() {
    if (this.projectForm.invalid) {
      this.projectForm.markAllAsTouched();
      return;
    }
    this.isSaving = true;
    this.loadingService.show('Creating project...');
    const formData = new FormData();
    const val = this.projectForm.value;
    formData.append('name', val.name);
    formData.append('description', val.description);
    formData.append('user', this.client._id);
    formData.append('totalAmount', val.totalAmount);
    formData.append('totalInstallments', val.totalInstallments);
    if (this.projectPhotoFile) formData.append('photo', this.projectPhotoFile);
    if (this.projectContractFile) formData.append('contract', this.projectContractFile);
    val.installments.forEach((inst: any, i: number) => {
      formData.append(`installments[${i}][amount]`, inst.amount);
      formData.append(`installments[${i}][createdAt]`, inst.createdAt);
    });
    val.agreedItems.forEach((item: any, i: number) => {
      formData.append(`agreedItems[${i}][name]`, item.name);
      formData.append(`agreedItems[${i}][numberOfItems]`, item.numberOfItems);
    });

    this.projectsService.createProject(formData).subscribe({
      next: (res) => {
        this.isSaving = false;
        this.loadingService.hide();
        this.client.projects = [...(this.client.projects || []), res.data];
        this.client.projectsCount = (this.client.projectsCount || 0) + 1;
        this.toggleProjectModal();
        this.cdr.detectChanges();
        this.alert.success(`Project "${res.data.name}" created successfully!`);
      },
      error: (err) => {
        this.isSaving = false;
        this.loadingService.hide();
        this.alert.error(err.error?.message || 'Failed to create project');
      },
    });
  }

  onDeleteProject(id: string) {
    this.alert.confirm('Delete this project?').then((result: any) => {
      if (result.isConfirmed) {
        this.loadingService.show('Deleting project...');
        this.projectsService.deleteProject(id).subscribe({
          next: () => {
            this.client.projects = this.client.projects.filter((p: any) => p._id !== id);
            this.loadingService.hide();
            this.cdr.detectChanges();
            this.alert.success('Project deleted');
          },
          error: (err) => {
            this.loadingService.hide();
            this.alert.error(err.error?.message || 'Failed to delete project');
          },
        });
      }
    });
  }

  // ── Edit Client ─────────────────────────────────────────────────────────────

  toggleEditModal() {
    this.showEditModal = !this.showEditModal;
    if (this.showEditModal) {
      this.editData = { name: this.client.name, email: this.client.email, password: '' };
      this.editDisplayDuration = this.client.displayDuration ?? 60;
      this.showEditPassword = false;
      this.editLogoFile = this.editPhotoFile = this.editPatternFile = null;
      this.editLogoPreview = this.editPhotoPreview = this.editPatternPreview = null;
    }
  }

  onEditFile(event: any, type: 'logo' | 'photo' | 'pattern') {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      if (type === 'logo') { this.editLogoFile = file; this.editLogoPreview = result; }
      if (type === 'photo') { this.editPhotoFile = file; this.editPhotoPreview = result; }
      if (type === 'pattern') { this.editPatternFile = file; this.editPatternPreview = result; }
      this.cdr.detectChanges();
    };
    reader.readAsDataURL(file);
  }

  saveEdit() {
    this.isEditing = true;
    this.loadingService.show('Saving...');
    const formData = new FormData();
    formData.append('name', this.editData.name);
    formData.append('email', this.editData.email);
    if (this.editData.password) formData.append('password', this.editData.password);
    if (this.editLogoFile) formData.append('logo', this.editLogoFile);
    if (this.editPhotoFile) formData.append('photo', this.editPhotoFile);
    if (this.editPatternFile) formData.append('pattern', this.editPatternFile);

    this.usersService.updateUser(this.client._id, formData).subscribe({
      next: (res: any) => {
        this.isEditing = false;
        this.loadingService.hide();
        this.client = { ...this.client, ...res.data };
        this.toggleEditModal();
        this.cdr.detectChanges();
        this.alert.success('تم تحديث بيانات العميل بنجاح');
      },
      error: (err: any) => {
        this.isEditing = false;
        this.loadingService.hide();
        this.alert.error(err.error?.message || 'فشل التحديث');
      },
    });
  }

  updateDisplayDuration() {
    if (!this.editDisplayDuration || this.editDisplayDuration < 1) return;
    this.isUpdatingDuration = true;
    this.usersService.updateDisplayDuration(this.client._id, this.editDisplayDuration).subscribe({
      next: (res: any) => {
        this.isUpdatingDuration = false;
        this.client.displayDuration = res.data.displayDuration;
        this.cdr.detectChanges();
        this.alert.success('تم تحديث مدة العرض');
      },
      error: (err: any) => {
        this.isUpdatingDuration = false;
        this.alert.error(err.error?.message || 'فشل التحديث');
      },
    });
  }

  // ── Cameras ─────────────────────────────────────────────────────────────────

  loadCameras(userId: string) {
    this.isLoadingCameras = true;
    this.camerasService.getUserCameras(userId).subscribe({
      next: (res) => {
        this.cameras = res.data || [];
        this.isLoadingCameras = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.isLoadingCameras = false;
        this.cdr.detectChanges();
      },
    });
  }

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
          isActive: camera.isActive ?? true,
        });
      } else {
        this.cameraForm.reset({ displayDuration: 60, isActive: true });
      }
    } else {
      this.editingCamera = null;
    }
  }

  saveCamera() {
    if (this.cameraForm.invalid) {
      this.cameraForm.markAllAsTouched();
      return;
    }
    this.isSavingCamera = true;
    const val = this.cameraForm.value;
    const lastPic = val.lastPic?.trim();
    const cameraVideo = val.cameraVideo?.trim();
    const formData = new FormData();
    formData.append('name', val.name.trim());
    formData.append('user', this.client._id);
    formData.append('displayDuration', String(val.displayDuration));
    if (lastPic) formData.append('lastPic', lastPic);
    if (cameraVideo) formData.append('cameraVideo', cameraVideo);

    const request = this.editingCamera
      ? this.camerasService.updateCamera(this.editingCamera._id, formData)
      : this.camerasService.createCamera(formData);

    request.subscribe({
      next: (res: any) => {
        this.isSavingCamera = false;
        if (this.editingCamera) {
          this.cameras = this.cameras.map((c) => (c._id === this.editingCamera._id ? res.data : c));
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
      },
    });
  }

  toggleCameraActive(camera: any) {
    this.camerasService.toggleStatus(camera._id).subscribe({
      next: (res: any) => {
        this.cameras = this.cameras.map((c) =>
          c._id === camera._id ? { ...c, isActive: res.data.isActive } : c,
        );
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        this.alert.error(err.error?.message || 'فشل التحديث');
      },
    });
  }

  deleteCamera(id: string) {
    this.alert.confirm('حذف هذه الكاميرا؟').then((result: any) => {
      if (result.isConfirmed) {
        this.camerasService.deleteCamera(id).subscribe({
          next: () => {
            this.cameras = this.cameras.filter((c) => c._id !== id);
            this.cdr.detectChanges();
            this.alert.success('تم حذف الكاميرا');
          },
          error: (err: any) => {
            this.alert.error(err.error?.message || 'فشل الحذف');
          },
        });
      }
    });
  }

  // ── Ad Videos ────────────────────────────────────────────────────────────────

  loadAdVideos(userId: string) {
    this.isLoadingAdVideos = true;
    this.adVideoService.getUserAdVideos(userId).subscribe({
      next: (res) => {
        this.adVideos = res.data || [];
        this.isLoadingAdVideos = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.isLoadingAdVideos = false;
        this.cdr.detectChanges();
      },
    });
  }

  toggleAdVideoModal() {
    this.showAdVideoModal = !this.showAdVideoModal;
    if (this.showAdVideoModal) {
      this.adVideoInputType = 'file';
      this.adVideoFile = null;
      this.adVideoLink = '';
    }
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

    this.adVideoService.createAdVideo(this.client._id, formData).subscribe({
      next: (res: any) => {
        this.isSavingAdVideo = false;
        this.adVideos = [...this.adVideos, res.data];
        this.toggleAdVideoModal();
        this.cdr.detectChanges();
        this.alert.success('تم إضافة الفيديو بنجاح');
      },
      error: (err: any) => {
        this.isSavingAdVideo = false;
        this.alert.error(err.error?.message || 'فشل رفع الفيديو');
      },
    });
  }

  deleteAdVideo(id: string) {
    this.alert.confirm('حذف هذا الفيديو؟').then((result: any) => {
      if (result.isConfirmed) {
        this.adVideoService.deleteAdVideo(id).subscribe({
          next: () => {
            this.adVideos = this.adVideos.filter((v) => v._id !== id);
            this.cdr.detectChanges();
            this.alert.success('تم حذف الفيديو');
          },
          error: (err: any) => {
            this.alert.error(err.error?.message || 'فشل الحذف');
          },
        });
      }
    });
  }
}
