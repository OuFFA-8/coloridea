import { Component, inject, OnDestroy, OnInit, PLATFORM_ID, Output, EventEmitter } from '@angular/core';
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
})
export class Header implements OnInit, OnDestroy {
  private platformId = inject(PLATFORM_ID);
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
      });
      this.unreadSub = this.notificationsService.unreadCount$.subscribe((c) => {
        this.unreadCount = c;
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
