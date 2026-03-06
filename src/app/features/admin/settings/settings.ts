import { ChangeDetectorRef, Component, inject, OnInit, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { TranslateModule } from '@ngx-translate/core';
import { environment } from '../../../../environments/environment';
import { AuthServices } from '../../../core/services/auth-services/auth-services';
import { LoadingService } from '../../../core/services/loading-service/loading-service';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TranslateModule],
  templateUrl: './settings.html',
  styleUrl: './settings.css',
})
export class Settings implements OnInit {
  private platformId = inject(PLATFORM_ID);
  private cdr = inject(ChangeDetectorRef);
  private loadingService = inject(LoadingService);

  user: any = null;
  baseUrl = environment.baseUrl;
  adminApiUrl = `${environment.baseUrl}/api/v1/admin`;
  usersApiUrl = `${environment.baseUrl}/api/v1/users`;

  profileForm!: FormGroup;
  passwordForm!: FormGroup;
  emailRequestForm!: FormGroup;

  isSavingProfile = false;
  isSavingPassword = false;
  isSendingEmail = false;
  emailRequestSent = false;

  showCurrent = false;
  showNew = false;
  showConfirm = false;

  successMsg = '';
  errorMsg = '';

  photoPreview: string | null = null;
  selectedPhoto: File | null = null;

  activeTab: 'profile' | 'password' | 'email' = 'profile';

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private authServices: AuthServices,
  ) {}

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.user = this.authServices.getUser();
      this.initForms();
    }
  }

  initForms() {
    this.profileForm = this.fb.group({
      name: [this.user?.name || '', Validators.required],
    });
    this.passwordForm = this.fb.group({
      currentPassword: ['', [Validators.required, Validators.minLength(6)]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required],
    });
    this.emailRequestForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
    });
  }

  getPhotoUrl(path: string | null): string {
    return path ? `${this.baseUrl}/${path.replace(/\\/g, '/')}` : '';
  }

  showSuccess(msg: string) {
    this.successMsg = msg;
    this.errorMsg = '';
    setTimeout(() => {
      this.successMsg = '';
      this.cdr.detectChanges();
    }, 4000);
  }
  showError(msg: string) {
    this.errorMsg = msg;
    this.successMsg = '';
    setTimeout(() => {
      this.errorMsg = '';
      this.cdr.detectChanges();
    }, 4000);
  }

  onPhotoSelected(event: any) {
    const file = event.target.files[0];
    if (!file) return;
    this.selectedPhoto = file;
    const reader = new FileReader();
    reader.onload = (e: any) => {
      this.photoPreview = e.target.result;
      this.cdr.detectChanges();
    };
    reader.readAsDataURL(file);
  }

  // PATCH /api/v1/admin/me — name + photo
  saveProfile() {
    if (this.profileForm.invalid) return;
    this.isSavingProfile = true;
    this.loadingService.show('Saving...');
    const fd = new FormData();
    fd.append('name', this.profileForm.value.name);
    if (this.selectedPhoto) fd.append('photo', this.selectedPhoto);
    this.http.patch(`${this.adminApiUrl}/me`, fd).subscribe({
      next: (res: any) => {
        this.isSavingProfile = false;
        this.loadingService.hide();
        this.user = res.data;
        this.authServices.updateStoredUser(res.data);
        this.selectedPhoto = null;
        this.photoPreview = null;
        this.showSuccess('Profile updated successfully');
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        this.isSavingProfile = false;
        this.loadingService.hide();
        this.showError(err.error?.message || 'Failed to update profile');
      },
    });
  }

  // PATCH /api/v1/auth/updatePassword
  savePassword() {
    if (this.passwordForm.invalid) return;
    const { currentPassword, password, confirmPassword } = this.passwordForm.value;
    if (password !== confirmPassword) {
      this.showError('Passwords do not match');
      return;
    }
    this.isSavingPassword = true;
    this.loadingService.show('Changing password...');
    this.authServices.updatePassword({ currentPassword, password, confirmPassword }).subscribe({
      next: () => {
        this.isSavingPassword = false;
        this.loadingService.hide();
        this.passwordForm.reset();
        this.showSuccess('Password changed successfully');
      },
      error: (err: any) => {
        this.isSavingPassword = false;
        this.loadingService.hide();
        this.showError(err.error?.message || 'Failed to change password');
      },
    });
  }

  // PATCH /api/v1/users/email/request-change
  requestEmailChange() {
    if (this.emailRequestForm.invalid) return;
    this.isSendingEmail = true;
    this.loadingService.show('Sending...');
    this.http
      .patch(`${this.usersApiUrl}/email/request-change`, {
        email: this.emailRequestForm.value.email,
      })
      .subscribe({
        next: () => {
          this.isSendingEmail = false;
          this.loadingService.hide();
          this.emailRequestSent = true;
          this.cdr.detectChanges();
        },
        error: (err: any) => {
          this.isSendingEmail = false;
          this.loadingService.hide();
          this.showError(err.error?.message || 'Failed to send verification email');
        },
      });
  }
}
