import { isPlatformBrowser } from '@angular/common';
import { Component, inject, OnInit, PLATFORM_ID } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { environment } from '../../../../environments/environment';
import { AuthServices } from '../../../core/services/auth-services/auth-services';
import { LoadingService } from '../../../core/services/loading-service/loading-service';
import { effect } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-admin-sidebar',
  imports: [RouterModule, TranslatePipe],
  templateUrl: './admin-sidebar.html',
  styleUrl: './admin-sidebar.css',
})
export class AdminSidebar implements OnInit {
  private platformId = inject(PLATFORM_ID);
  private loadingService = inject(LoadingService);

  user: any = null;
  baseUrl = environment.baseUrl;
  animated = false; // بنتحكم فيها عشان نشغل الأنيميشن

  constructor(
    private authServices: AuthServices,
    private router: Router,
  ) {
    // لما اللودينج يختفي نشغل الأنيميشن
    effect(() => {
      const isVisible = this.loadingService.visible();
      if (!isVisible && isPlatformBrowser(this.platformId)) {
        // delay صغير عشان الـ DOM يتحدث
        setTimeout(() => {
          this.animated = false;
          requestAnimationFrame(() => {
            this.animated = true;
          });
        }, 50);
      }
    });
  }

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.user = this.authServices.getUser();
    }
  }

  getPhotoUrl(path: string | null): string {
    if (!path) return '';
    return `${this.baseUrl}/${path.replace(/\\/g, '/')}`;
  }

  logout() {
    this.authServices.logout();
    this.router.navigate(['/login']);
  }
}
