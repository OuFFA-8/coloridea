import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthServices } from '../../../core/services/auth-services/auth-services';
import { Router, RouterLink } from '@angular/router';
import { AlertService } from '../../../core/services/alert-service/alert-service';
import { LoadingService } from '../../../core/services/loading-service/loading-service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  private loadingService = inject(LoadingService);

  loginForm: FormGroup;
  isLoading = false;
  showPassword = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthServices,
    private router: Router,
    private alert: AlertService,
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  onSubmit() {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    this.loadingService.show('Signing in...');

    this.authService.login(this.loginForm.value).subscribe({
      next: (res) => {
        this.isLoading = false;
        localStorage.setItem('token', res.token);
        localStorage.setItem('user', JSON.stringify(res.data));
        this.loadingService.hide();

        if (this.authService.isAdmin()) {
          this.router.navigate(['/admin/dashboard']);
        } else {
          this.router.navigate(['/select-project']); // ← fix: أزلنا الـ space
        }
      },
      error: (err) => {
        this.isLoading = false;
        this.loadingService.hide();
        this.alert.error(err.error?.message || 'Connection error, please try again');
      },
    });
  }
}
