import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, inject, OnDestroy, OnInit, PLATFORM_ID } from '@angular/core';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterModule } from '@angular/router';
import { Subscription, filter } from 'rxjs';
import { AuthServices } from '../../../core/services/auth-services/auth-services';

@Component({
  selector: 'app-client-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './client-sidebar.html',
  styleUrl: './client-sidebar.css',
})
export class ClientSidebar implements OnInit, OnDestroy {
  private platformId = inject(PLATFORM_ID);
  private routerSub!: Subscription;

  projectId = '';
  projectName = '';

  constructor(
    private router: Router,
    private authServices: AuthServices,
  ) {}

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      // اقرأ الـ project من localStorage
      this.readProjectFromStorage();

      // اتابع كل تغيير في الـ URL عشان تتحدث
      this.routerSub = this.router.events
        .pipe(filter((e) => e instanceof NavigationEnd))
        .subscribe(() => {
          this.readProjectFromStorage();
          this.extractProjectFromUrl();
        });

      // اقرأ من الـ URL مباشرة
      this.extractProjectFromUrl();
    }
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
    // بنستخرج الـ id من الـ URL مباشرة
    // /client/projects/:id أو /client/projects/:id/deliverables
    const url = this.router.url;
    const match = url.match(/\/client\/projects\/([^\/]+)/);
    if (match?.[1]) {
      this.projectId = match[1];
    }
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
  }
}
