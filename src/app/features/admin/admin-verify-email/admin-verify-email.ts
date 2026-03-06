import { CommonModule, isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { ChangeDetectorRef, Component, inject, OnInit, PLATFORM_ID } from '@angular/core';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { environment } from '../../../../environments/environment';
import { AuthServices } from '../../../core/services/auth-services/auth-services';

@Component({
  selector: 'app-admin-verify-email',
  standalone: true,
  imports: [CommonModule, TranslateModule, RouterLink],
  templateUrl: './admin-verify-email.html',
  styleUrl: './admin-verify-email.css',
})
export class AdminVerifyEmail implements OnInit {
  private platformId = inject(PLATFORM_ID);
  private cdr = inject(ChangeDetectorRef);

  state: 'loading' | 'success' | 'error' = 'loading';
  errorMsg = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient,
    private authServices: AuthServices,
  ) {}

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      const token = this.route.snapshot.paramMap.get('token');
      if (!token) {
        this.state = 'error';
        this.errorMsg = 'No verification token found.';
        this.cdr.detectChanges();
        return;
      }
      this.http.patch(`${environment.baseUrl}/api/v1/users/email/verify`, { token }).subscribe({
        next: () => {
          this.state = 'success';
          this.authServices.logout();
          this.cdr.detectChanges();
          setTimeout(() => this.router.navigate(['/auth/login']), 3000);
        },
        error: (err: any) => {
          this.state = 'error';
          this.errorMsg = err.error?.message || 'Invalid or expired verification link.';
          this.cdr.detectChanges();
        },
      });
    }
  }
}
