import { CommonModule, isPlatformBrowser } from '@angular/common';
import {
  ChangeDetectorRef,
  Component,
  inject,
  Input,
  Output,
  EventEmitter,
  OnDestroy,
  OnInit,
  PLATFORM_ID,
} from '@angular/core';
import { NavigationEnd, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { Subscription, filter } from 'rxjs';
import { TranslateModule } from '@ngx-translate/core';
import { AuthServices } from '../../../core/services/auth-services/auth-services';
import { environment } from '../../../../environments/environment';
import { TimelapseService } from '../../../core/services/timelapse-service/timelapse-service';

@Component({
  selector: 'app-client-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, TranslateModule],
  templateUrl: './client-sidebar.html',
  styleUrl: './client-sidebar.css',
})
export class ClientSidebar implements OnInit, OnDestroy {
  private platformId = inject(PLATFORM_ID);
  private cdr = inject(ChangeDetectorRef);
  private timelapseService = inject(TimelapseService);
  private routerSub!: Subscription;
  private themeObserver?: MutationObserver;
  private lastTimelapseProjectId = '';
  private projectChangedHandler = () => {
    this.readProjectFromStorage();
    this.syncTimelapseVisibility();
    this.cdr.detectChanges();
  };

  @Input() isOpen = false;
  @Output() closeEvent = new EventEmitter<void>();

  @Input() collapsed = false;
  @Output() toggleCollapse = new EventEmitter<void>();

  animated = true;
  isDark = true;
  projectId = '';
  projectName = '';
  pattern = '';
  clientLogo = '';
  role = '';
  managerPermissions: string[] = [];
  hasTimelapse = false;

  get projectLinks() {
    return [
      {
        path: ['/client/projects', this.projectId],
        icon: 'overview',
        label: 'SIDEBAR.OVERVIEW',
        exact: { exact: true },
      },
      {
        path: ['/client/projects', this.projectId, 'deliverables'],
        icon: 'deliverables',
        label: 'SIDEBAR.DELIVERABLES',
        exact: { exact: false },
      },
    ];
  }

  get showFinancials(): boolean {
    return (
      !!this.projectId &&
      (this.role !== 'manager' || this.managerPermissions.includes('view-financials'))
    );
  }

  get isUser(): boolean {
    return this.role === 'user';
  }

  get isManager(): boolean {
    return this.role === 'manager';
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
      this.syncTimelapseVisibility();

      this.routerSub = this.router.events
        .pipe(filter((e) => e instanceof NavigationEnd))
        .subscribe(() => {
          this.closeEvent.emit(); // غلق الـ drawer عند التنقل على الموبايل
          this.readProjectFromStorage();
          this.extractProjectFromUrl();
          this.syncTimelapseVisibility();
        });

      window.addEventListener('selectedProjectChanged', this.projectChangedHandler);

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
        if (user?.logo) {
          this.clientLogo = `${environment.baseUrl}/${user.logo.replace(/\\/g, '/')}`;
        }
      } catch {}
    }

    const token = localStorage.getItem('token');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        this.role = payload.role || '';
      } catch {}
    }

    const permsRaw = localStorage.getItem('managerPermissions');
    this.managerPermissions = permsRaw ? JSON.parse(permsRaw) : [];
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

  private syncTimelapseVisibility(): void {
    if (!this.projectId) {
      this.lastTimelapseProjectId = '';
      this.hasTimelapse = false;
      return;
    }

    if (this.projectId === this.lastTimelapseProjectId) return;

    this.lastTimelapseProjectId = this.projectId;

    this.timelapseService.getProjectTimelapse(this.projectId).subscribe({
      next: (res) => {
        this.hasTimelapse = !!res?.data?.[0]?.link;
        this.cdr.detectChanges();
      },
      error: () => {
        this.hasTimelapse = false;
        this.cdr.detectChanges();
      },
    });
  }

  logout() {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('selectedProject');
    }
    this.authServices.logout();
    this.router.navigate(['/login']);
  }

  ngOnDestroy() {
    this.routerSub?.unsubscribe();
    this.themeObserver?.disconnect();
    window.removeEventListener('selectedProjectChanged', this.projectChangedHandler);
  }
}
