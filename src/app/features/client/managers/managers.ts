import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnInit,
  PLATFORM_ID,
  inject,
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { TranslateModule } from '@ngx-translate/core';
import { ManagersService } from '../../../core/services/managers-service/managers-service';
import { Manager, ManagerProject, ManagerPermission } from '../../../core/models/manager';
import { CamerasService } from '../../../core/services/cameras-service/cameras-service';
import { ProjectsService } from '../../../core/services/projects-service/projects-service';
import { AuthServices } from '../../../core/services/auth-services/auth-services';
import { AlertService } from '../../../core/services/alert-service/alert-service';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-managers',
  imports: [CommonModule, ReactiveFormsModule, TranslateModule],
  templateUrl: './managers.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Managers implements OnInit {
  private cdr = inject(ChangeDetectorRef);
  private platformId = inject(PLATFORM_ID);
  private managersService = inject(ManagersService);
  private camerasService = inject(CamerasService);
  private projectsService = inject(ProjectsService);
  private authServices = inject(AuthServices);
  private alert = inject(AlertService);
  private fb = inject(FormBuilder);
  private router = inject(Router);

  readonly baseUrl = environment.baseUrl;

  // ── Managers list ─────────────────────────────────────────────────────────
  managers: Manager[] = [];
  isLoadingManagers = true;

  // ── Create / Edit Manager modal ───────────────────────────────────────────
  showManagerModal = false;
  editingManager: Manager | null = null;
  isSavingManager = false;
  showPassword = false;
  managerForm: FormGroup;

  // ── User cameras (for assignment to managers) ─────────────────────────────
  cameras: any[] = [];

  // ── Manage Projects modal ─────────────────────────────────────────────────
  showProjectsModal = false;
  selectedManager: Manager | null = null;
  userProjects: any[] = [];
  managerProjects: ManagerProject[] = [];
  isLoadingProjectsModal = false;
  isSavingProject: Record<string, boolean> = {};

  // Cache manager assignments across modal open/close within the same session
  private assignmentsCache = new Map<string, ManagerProject[]>();

  constructor() {
    this.managerForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.minLength(6)],
    });
  }

  async ngOnInit() {
    if (!isPlatformBrowser(this.platformId)) return;

    const role = this.authServices.getRole();
    if (role !== 'user') {
      this.router.navigate(['/select-project']);
      return;
    }

    const user = this.authServices.getUser();
    if (!user?._id) {
      this.router.navigate(['/login']);
      return;
    }

    await Promise.all([this.loadManagers(), this.loadCameras()]);
  }

  async loadManagers() {
    this.isLoadingManagers = true;
    const user = this.authServices.getUser();
    try {
      const res = await firstValueFrom(this.managersService.getUserManagers(user._id));
      this.managers = res.data || [];
    } catch {}
    this.isLoadingManagers = false;
    this.cdr.detectChanges();
  }

  async loadCameras() {
    try {
      const res = await firstValueFrom(this.camerasService.getMyCameras());
      this.cameras = res.data || [];
    } catch {}
    this.cdr.detectChanges();
  }

  // ── Create / Edit Manager ─────────────────────────────────────────────────

  openManagerModal(manager?: Manager) {
    this.editingManager = manager || null;
    this.managerForm.reset();

    if (manager) {
      this.managerForm.patchValue({ name: manager.name, email: manager.email });
      this.managerForm.get('password')?.clearValidators();
    } else {
      this.managerForm.get('password')?.setValidators([Validators.required, Validators.minLength(6)]);
    }
    this.managerForm.get('password')?.updateValueAndValidity();

    this.showManagerModal = true;
    this.showPassword = false;
    this.cdr.detectChanges();
  }

  closeManagerModal() {
    this.showManagerModal = false;
    this.editingManager = null;
    this.cdr.detectChanges();
  }

  saveManager() {
    if (this.managerForm.invalid) {
      this.managerForm.markAllAsTouched();
      return;
    }
    this.isSavingManager = true;
    const val = this.managerForm.value;

    if (this.editingManager) {
      const payload: any = { name: val.name, email: val.email };
      if (val.password?.trim()) payload.password = val.password;
      this.managersService.updateManager(this.editingManager._id, payload).subscribe({
        next: (res) => {
          this.isSavingManager = false;
          this.managers = this.managers.map((m) =>
            m._id === this.editingManager!._id ? { ...m, ...res.data } : m,
          );
          this.alert.success('تم تحديث المشرف بنجاح');
          this.closeManagerModal();
          this.cdr.detectChanges();
        },
        error: (err: any) => {
          this.isSavingManager = false;
          this.alert.error(err.error?.message || 'فشل تحديث المشرف');
          this.cdr.detectChanges();
        },
      });
    } else {
      this.managersService.createManager({ name: val.name, email: val.email, password: val.password }).subscribe({
        next: (res) => {
          this.isSavingManager = false;
          this.managers = [...this.managers, res.data.manager || res.data];
          this.alert.success('تم إنشاء المشرف بنجاح');
          this.closeManagerModal();
          this.cdr.detectChanges();
        },
        error: (err: any) => {
          this.isSavingManager = false;
          this.alert.error(err.error?.message || 'فشل إنشاء المشرف');
          this.cdr.detectChanges();
        },
      });
    }
  }

  deleteManager(manager: Manager) {
    this.alert.confirm(`حذف المشرف "${manager.name}"؟`).then((result: any) => {
      if (!result.isConfirmed) return;
      this.managersService.deleteManager(manager._id).subscribe({
        next: () => {
          this.managers = this.managers.filter((m) => m._id !== manager._id);
          this.alert.success('تم حذف المشرف');
          this.cdr.detectChanges();
        },
        error: (err: any) => this.alert.error(err.error?.message || 'فشل الحذف'),
      });
    });
  }

  // ── Manager cameras ───────────────────────────────────────────────────────

  isCameraAssigned(manager: Manager, cameraId: string): boolean {
    return manager.cameras.includes(cameraId);
  }

  toggleCamera(manager: Manager, cameraId: string) {
    const cameras = this.isCameraAssigned(manager, cameraId)
      ? manager.cameras.filter((id) => id !== cameraId)
      : [...manager.cameras, cameraId];

    this.managersService.updateManager(manager._id, { cameras }).subscribe({
      next: (res) => {
        this.managers = this.managers.map((m) =>
          m._id === manager._id ? { ...m, cameras: res.data?.cameras ?? cameras } : m,
        );
        this.cdr.detectChanges();
      },
      error: (err: any) => this.alert.error(err.error?.message || 'فشل تحديث الكاميرات'),
    });
  }

  // ── Manage Projects modal ─────────────────────────────────────────────────

  async openProjectsModal(manager: Manager) {
    this.selectedManager = manager;
    this.showProjectsModal = true;
    this.isLoadingProjectsModal = true;
    this.userProjects = [];
    this.managerProjects = [];
    this.isSavingProject = {};
    this.cdr.detectChanges();

    const user = this.authServices.getUser();

    try {
      const projectsRes = await firstValueFrom(this.projectsService.getUserProjects(user._id));
      this.userProjects = projectsRes.data || [];
    } catch {}

    try {
      const managerProjectsRes = await firstValueFrom(this.managersService.getManagerProjects(manager._id));
      const raw = managerProjectsRes.data ?? managerProjectsRes;
      const fresh: ManagerProject[] = Array.isArray(raw) ? raw : [];
      const cached = this.assignmentsCache.get(manager._id) ?? [];

      // API is source of truth for assignments, cache is source of truth for permissions
      // (since GET /managers/:id/projects doesn't return permissions field)
      this.managerProjects = fresh.map((mp) => {
        const pid = typeof mp.project === 'object' ? mp.project?._id : mp.project;
        const cachedMp = cached.find((c) => {
          const cpid = typeof c.project === 'object' ? c.project?._id : c.project;
          return cpid === pid;
        });
        return cachedMp?.permissions?.length ? { ...mp, permissions: cachedMp.permissions } : mp;
      });
      this.assignmentsCache.set(manager._id, this.managerProjects);
    } catch {
      this.managerProjects = this.assignmentsCache.get(manager._id) ?? [];
    }

    this.isLoadingProjectsModal = false;
    this.cdr.detectChanges();
  }

  closeProjectsModal() {
    this.showProjectsModal = false;
    this.selectedManager = null;
    this.cdr.detectChanges();
  }

  getManagerProject(projectId: string): ManagerProject | null {
    return (
      this.managerProjects.find((mp) => {
        const pid = typeof mp.project === 'string' ? mp.project : mp.project?._id;
        return pid === projectId;
      }) || null
    );
  }

  isProjectAssigned(projectId: string): boolean {
    return !!this.getManagerProject(projectId);
  }

  toggleProject(project: any) {
    if (!this.selectedManager) return;
    const mp = this.getManagerProject(project._id);
    this.isSavingProject[project._id] = true;
    this.cdr.detectChanges();

    if (mp) {
      this.managersService.removeProjectFromManager(this.selectedManager._id, project._id).subscribe({
        next: () => {
          this.managerProjects = this.managerProjects.filter((x) => x._id !== mp._id);
          this.assignmentsCache.set(this.selectedManager!._id, this.managerProjects);
          this.isSavingProject[project._id] = false;
          this.cdr.detectChanges();
        },
        error: (err: any) => {
          this.isSavingProject[project._id] = false;
          this.alert.error(err.error?.message || 'فشل إلغاء ربط المشروع');
          this.cdr.detectChanges();
        },
      });
    } else {
      this.managersService.addProjectToManager(this.selectedManager._id, project._id).subscribe({
        next: (res) => {
          const entry = { ...res.data };
          if (typeof entry.project !== 'object' || !entry.project?._id) {
            entry.project = project;
          }
          this.managerProjects = [...this.managerProjects, entry];
          this.assignmentsCache.set(this.selectedManager!._id, this.managerProjects);
          this.isSavingProject[project._id] = false;
          this.cdr.detectChanges();
        },
        error: (err: any) => {
          this.isSavingProject[project._id] = false;
          this.alert.error(err.error?.message || 'فشل إضافة المشروع');
          this.cdr.detectChanges();
        },
      });
    }
  }

  hasPermission(projectId: string, perm: ManagerPermission): boolean {
    return (this.getManagerProject(projectId)?.permissions ?? []).includes(perm);
  }

  togglePermission(projectId: string, perm: ManagerPermission) {
    if (!this.selectedManager) return;
    const mp = this.getManagerProject(projectId);
    if (!mp) return;

    const currentPerms: ManagerPermission[] = mp.permissions ?? [];
    const permissions: ManagerPermission[] = this.hasPermission(projectId, perm)
      ? currentPerms.filter((p) => p !== perm)
      : [...currentPerms, perm];

    this.managersService
      .updateManagerProjectPermissions(this.selectedManager._id, projectId, permissions)
      .subscribe({
        next: () => {
          this.managerProjects = this.managerProjects.map((x) =>
            x._id === mp._id ? { ...x, permissions } : x,
          );
          if (this.selectedManager) {
            this.assignmentsCache.set(this.selectedManager._id, this.managerProjects);
          }
          this.cdr.detectChanges();
        },
        error: (err: any) => this.alert.error(err.error?.message || 'فشل تحديث الصلاحيات'),
      });
  }

  getProjectPhotoUrl(path: string | null | undefined): string {
    return path ? `${this.baseUrl}/${path.replace(/\\/g, '/')}` : '';
  }
}
