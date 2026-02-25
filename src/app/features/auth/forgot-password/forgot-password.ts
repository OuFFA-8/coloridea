import { Component } from '@angular/core';
import { FormGroup, FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common'; // مهم جداً للـ *ngIf والـ Class Binding
import { AuthServices } from '../../../core/services/auth-services/auth-services';
import { AlertService } from '../../../core/services/alert-service/alert-service';
import { RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, RouterLink, TranslateModule],
  templateUrl: './forgot-password.html',
  styleUrl: './forgot-password.css',
})
export class ForgotPassword {
  form: FormGroup;
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthServices,
    private alert: AlertService,
  ) {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
    });
  }

  onSubmit() {
    if (this.form.invalid) return;
    this.isLoading = true;
    this.authService.forgetPassword(this.form.value.email).subscribe({
      next: (res) => {
        this.isLoading = false;
        this.alert.success(res.message || 'Check your email for the reset link');
      },
      error: (err) => {
        this.isLoading = false;
        this.alert.error(err.error?.message || 'Connection error, please try again');
      },
    });
  }
}
