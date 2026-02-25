import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { AuthServices } from '../../../core/services/auth-services/auth-services';
import { AlertService } from '../../../core/services/alert-service/alert-service';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, TranslateModule],
  templateUrl: './reset-password.html',
  styleUrl: './reset-password.css',
})
export class ResetPassword implements OnInit {
  form: FormGroup;
  isLoading = false;
  token = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthServices,
    private route: ActivatedRoute,
    private router: Router,
    private alert: AlertService,
  ) {
    this.form = this.fb.group(
      {
        password: ['', [Validators.required, Validators.minLength(8)]],
        confirmPassword: ['', Validators.required],
      },
      { validators: this.passwordMatchValidator },
    );
  }

  ngOnInit() {
    this.token = this.route.snapshot.paramMap.get('token') || '';
  }

  passwordMatchValidator(form: FormGroup) {
    const pass = form.get('password')?.value;
    const confirm = form.get('confirmPassword')?.value;
    return pass === confirm ? null : { mismatch: true };
  }

  onSubmit() {
    if (this.form.invalid || !this.token) return;
    this.isLoading = true;
    this.authService.resetPassword(this.token, this.form.value).subscribe({
      next: () => {
        this.isLoading = false;
        this.alert.success('Your password has been updated successfully').then(() => {
          this.router.navigate(['/login']);
        });
      },
      error: (err) => {
        this.isLoading = false;
        this.alert.error(err.error?.message || 'Invalid or expired token');
      },
    });
  }
}
