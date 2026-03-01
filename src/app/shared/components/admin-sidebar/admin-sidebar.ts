import { isPlatformBrowser } from '@angular/common';
import { Component, effect, inject, OnDestroy, OnInit, PLATFORM_ID } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { environment } from '../../../../environments/environment';
import { AuthServices } from '../../../core/services/auth-services/auth-services';
import { LoadingService } from '../../../core/services/loading-service/loading-service';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-admin-sidebar',
  imports: [RouterModule, TranslatePipe],
  templateUrl: './admin-sidebar.html',
  styleUrl: './admin-sidebar.css',
})
export class AdminSidebar implements OnInit, OnDestroy {
  private platformId = inject(PLATFORM_ID);
  private loadingService = inject(LoadingService);
  private themeObserver?: MutationObserver;

  user: any = null;
  baseUrl = environment.baseUrl;
  animated = false;
  isDark = true;

  constructor(
    private authServices: AuthServices,
    private router: Router,
  ) {
    effect(() => {
      const isVisible = this.loadingService.visible();
      if (!isVisible && isPlatformBrowser(this.platformId)) {
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
      this.detectTheme();

      this.themeObserver = new MutationObserver(() => this.detectTheme());
      this.themeObserver.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ['class'],
      });
    }
  }

  detectTheme() {
    this.isDark = document.documentElement.classList.contains('dark');
  }

  getPhotoUrl(path: string | null): string {
    if (!path) return '';
    return `${this.baseUrl}/${path.replace(/\\/g, '/')}`;
  }

  logout() {
    this.authServices.logout();
    this.router.navigate(['/login']);
  }

  ngOnDestroy() {
    this.themeObserver?.disconnect();
  }
}
