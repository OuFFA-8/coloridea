import { CommonModule, isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { ChangeDetectorRef, Component, inject, OnInit, PLATFORM_ID } from '@angular/core';
import { FormGroup, FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { environment } from '../../../../environments/environment';
import { AuthServices } from '../../../core/services/auth-services/auth-services';
import { LoadingService } from '../../../core/services/loading-service/loading-service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TranslateModule],
  templateUrl: './profile.html',
  styleUrl: './profile.css',
})
export class Profile implements OnInit {
  private platformId = inject(PLATFORM_ID);
  private cdr = inject(ChangeDetectorRef);
  private loadingService = inject(LoadingService);

  user: any = null;
  baseUrl = environment.baseUrl;
  apiUrl = `${environment.baseUrl}/api/v1/users`;

  profileForm!: FormGroup;
  passwordForm!: FormGroup;
  emailRequestForm!: FormGroup;
  emailVerifyForm!: FormGroup;

  isSavingProfile = false;
  isSavingPassword = false;
  isSendingEmail = false;
  isVerifyingEmail = false;
  emailRequestSent = false;
  successMsg = '';
  errorMsg = '';

  photoPreview: string | null = null;
  logoPreview: string | null = null;
  patternPreview: string | null = null;
  selectedPhoto: File | null = null;
  selectedLogo: File | null = null;
  selectedPattern: File | null = null;

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
    this.profileForm = this.fb.group({ name: [this.user?.name || '', Validators.required] });
    this.passwordForm = this.fb.group({
      currentPassword: ['', [Validators.required, Validators.minLength(6)]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required],
    });
    this.emailRequestForm = this.fb.group({
      email: [this.user?.email || '', [Validators.required, Validators.email]],
    });
    this.emailVerifyForm = this.fb.group({ token: ['', Validators.required] });
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

  onFileSelected(event: any, type: 'photo' | 'logo' | 'pattern') {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e: any) => {
      if (type === 'photo') {
        this.photoPreview = e.target.result;
        this.selectedPhoto = file;
      }
      if (type === 'logo') {
        this.logoPreview = e.target.result;
        this.selectedLogo = file;
      }
      if (type === 'pattern') {
        this.patternPreview = e.target.result;
        this.selectedPattern = file;
      }
      this.cdr.detectChanges();
    };
    reader.readAsDataURL(file);
  }

  saveProfile() {
    if (this.profileForm.invalid) return;
    this.isSavingProfile = true;
    this.loadingService.show('Saving...');
    const fd = new FormData();
    fd.append('name', this.profileForm.value.name);
    if (this.selectedPhoto) fd.append('photo', this.selectedPhoto);
    if (this.selectedLogo) fd.append('logo', this.selectedLogo);
    if (this.selectedPattern) fd.append('pattern', this.selectedPattern);
    this.http.patch(`${this.apiUrl}/me`, fd).subscribe({
      next: (res: any) => {
        this.isSavingProfile = false;
        this.loadingService.hide();
        this.user = res.data;
        this.authServices.updateStoredUser(res.data);
        this.selectedPhoto = this.selectedLogo = this.selectedPattern = null;
        this.photoPreview = this.logoPreview = this.patternPreview = null;
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

  requestEmailChange() {
    if (this.emailRequestForm.invalid) return;
    this.isSendingEmail = true;
    this.loadingService.show('Sending...');
    this.http
      .patch(`${this.apiUrl}/email/request-change`, { email: this.emailRequestForm.value.email })
      .subscribe({
        next: () => {
          this.isSendingEmail = false;
          this.loadingService.hide();
          this.emailRequestSent = true;
        },
        error: (err: any) => {
          this.isSendingEmail = false;
          this.loadingService.hide();
          this.showError(err.error?.message || 'Failed to send verification email');
        },
      });
  }

  verifyEmail() {
    if (this.emailVerifyForm.invalid) return;
    this.isVerifyingEmail = true;
    this.loadingService.show('Verifying...');
    this.http
      .patch(`${this.apiUrl}/email/verify`, { token: this.emailVerifyForm.value.token })
      .subscribe({
        next: (res: any) => {
          this.isVerifyingEmail = false;
          this.loadingService.hide();
          this.emailRequestSent = false;
          this.emailVerifyForm.reset();
          if (res.data) {
            this.user = res.data;
            this.authServices.updateStoredUser(res.data);
          }
          this.showSuccess('Email changed successfully');
          this.cdr.detectChanges();
        },
        error: (err: any) => {
          this.isVerifyingEmail = false;
          this.loadingService.hide();
          this.showError(err.error?.message || 'Invalid or expired token');
        },
      });
  }
}
