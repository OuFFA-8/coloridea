import { ChangeDetectionStrategy, ChangeDetectorRef, Component, inject, OnDestroy, OnInit, PLATFORM_ID, Output, EventEmitter } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { MyTranslate } from '../../../core/services/my-translate/my-translate';
import { ThemeServices } from '../../../core/services/theme-services/theme-services';
import { Router, RouterLink } from '@angular/router';
import { environment } from '../../../../environments/environment';
import { AuthServices } from '../../../core/services/auth-services/auth-services';
import { NotificationsService, Notification } from '../../../core/services/notifications-service/notifications-service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, TranslateModule, RouterLink],
  templateUrl: './header.html',
  styleUrl: './header.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Header implements OnInit, OnDestroy {
  private platformId = inject(PLATFORM_ID);
  private cdr = inject(ChangeDetectorRef);
  private userSub?: Subscription;
  private notifSub?: Subscription;
  private unreadSub?: Subscription;

  notificationsService = inject(NotificationsService);

  @Output() toggleSidebar = new EventEmitter<void>();

  user: any = null;
  baseUrl = environment.baseUrl;
  dropdownOpen = false;
  notifOpen = false;
  notifications: Notification[] = [];
  unreadCount = 0;

  constructor(
    public themeService: ThemeServices,
    public myTrans: MyTranslate,
    public authServices: AuthServices,
    private router: Router,
  ) {}

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.userSub = this.authServices.user$.subscribe((u) => {
        this.user = u;
        if (u && !this.authServices.isAdmin()) {
          const token = localStorage.getItem('token') || '';
          this.notificationsService.connect(token);
          this.notificationsService.loadNotifications();
        }
      });

      this.notifSub = this.notificationsService.notifications$.subscribe((n) => {
        this.notifications = n;
        this.cdr.markForCheck();
      });
      this.unreadSub = this.notificationsService.unreadCount$.subscribe((c) => {
        this.unreadCount = c;
        this.cdr.markForCheck();
      });
    }
  }

  ngOnDestroy() {
    this.userSub?.unsubscribe();
    this.notifSub?.unsubscribe();
    this.unreadSub?.unsubscribe();
  }

  getPhotoUrl(path: string | null): string {
    if (!path) return '';
    return `${this.baseUrl}/${path.replace(/\\/g, '/')}`;
  }

  toggleLanguage() {
    this.myTrans.changeLang(this.myTrans.currentLang === 'en' ? 'ar' : 'en');
  }

  toggleDropdown() {
    this.dropdownOpen = !this.dropdownOpen;
    if (this.dropdownOpen) this.notifOpen = false;
  }

  toggleNotifications() {
    this.notifOpen = !this.notifOpen;
    if (this.notifOpen) this.dropdownOpen = false;
  }

  onNotifClick(n: Notification) {
    if (!n.isRead) this.notificationsService.markRead(n._id);
  }

  getNotifRoute(n: Notification): string | null {
    const projectId = n.project ?? null;
    const text = `${n.title.ar} ${n.title.en} ${n.message.ar} ${n.message.en}`.toLowerCase();

    if (projectId) {
      if (text.includes('مخرج') || text.includes('output') || text.includes('deliverable')) {
        return `/client/projects/${projectId}/deliverables`;
      }
      if (
        text.includes('فاتور') || text.includes('إيصال') || text.includes('عقد') ||
        text.includes('invoice') || text.includes('receipt') || text.includes('contract') ||
        text.includes('مالي') || text.includes('financial') || text.includes('دفع') || text.includes('payment')
      ) {
        return `/client/projects/${projectId}/financials`;
      }
      return `/client/projects/${projectId}`;
    }

    return null;
  }

  navigateFromNotif(event: Event, n: Notification) {
    event.stopPropagation();
    const route = this.getNotifRoute(n);
    if (!route) return;
    if (!n.isRead) this.notificationsService.markRead(n._id);
    this.notifOpen = false;
    this.router.navigate([route]);
  }

  logout() {
    this.authServices.logout();
    this.dropdownOpen = false;
    this.notificationsService.disconnect();
    this.router.navigate(['/login']);
  }

  getNotifText(n: Notification, field: 'title' | 'message'): string {
    return this.myTrans.currentLang === 'ar' ? n[field].ar : n[field].en;
  }
}
