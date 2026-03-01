import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, inject, OnDestroy, OnInit, PLATFORM_ID } from '@angular/core';
import { NavigationEnd, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { Subscription, filter } from 'rxjs';
import { TranslateModule } from '@ngx-translate/core';
import { AuthServices } from '../../../core/services/auth-services/auth-services';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-client-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, TranslateModule],
  templateUrl: './client-sidebar.html',
  styleUrl: './client-sidebar.css',
})
export class ClientSidebar implements OnInit, OnDestroy {
  private platformId = inject(PLATFORM_ID);
  private routerSub!: Subscription;
  private themeObserver?: MutationObserver;

  animated = true;
  isDark = true;
  projectId = '';
  projectName = '';
  pattern = ''; // باترن السايدبار بتاع العميل

  get projectLinks() {
    return [
      {
        path: ['/client/projects', this.projectId],
        icon: 'overview',
        label: 'SIDEBAR.OVERVIEW',
        exact: { exact: true } as const,
      },
      {
        path: ['/client/projects', this.projectId, 'deliverables'],
        icon: 'deliverables',
        label: 'SIDEBAR.DELIVERABLES',
        exact: { exact: false } as const,
      },
      {
        path: ['/client/projects', this.projectId, 'financials'],
        icon: 'financials',
        label: 'SIDEBAR.FINANCIALS',
        exact: { exact: false } as const,
      },
    ];
  }

  constructor(
    private router: Router,
    private authServices: AuthServices,
  ) {}

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.readProjectFromStorage();
      this.extractProjectFromUrl();
      this.loadUserPattern();
      this.detectTheme();

      this.routerSub = this.router.events
        .pipe(filter((e) => e instanceof NavigationEnd))
        .subscribe(() => {
          this.readProjectFromStorage();
          this.extractProjectFromUrl();
        });

      this.themeObserver = new MutationObserver(() => this.detectTheme());
      this.themeObserver.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ['class'],
      });
    }
  }

  loadUserPattern() {
    const stored = localStorage.getItem('user');
    if (stored) {
      try {
        const user = JSON.parse(stored);
        if (user?.pattern) {
          this.pattern = `${environment.baseUrl}/${user.pattern.replace(/\\/g, '/')}`;
        }
      } catch {}
    }
  }

  detectTheme() {
    this.isDark = document.documentElement.classList.contains('dark');
  }

  readProjectFromStorage() {
    if (!isPlatformBrowser(this.platformId)) return;
    const stored = localStorage.getItem('selectedProject');
    if (stored) {
      const p = JSON.parse(stored);
      this.projectId = p._id || '';
      this.projectName = p.name || '';
    }
  }

  extractProjectFromUrl() {
    const match = this.router.url.match(/\/client\/projects\/([^\/]+)/);
    if (match?.[1]) this.projectId = match[1];
  }

  logout() {
    if (isPlatformBrowser(this.platformId)) localStorage.removeItem('selectedProject');
    this.authServices.logout();
    this.router.navigate(['/login']);
  }

  ngOnDestroy() {
    this.routerSub?.unsubscribe();
    this.themeObserver?.disconnect();
  }
}
