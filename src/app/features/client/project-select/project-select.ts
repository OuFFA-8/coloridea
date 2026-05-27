import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ChangeDetectorRef, Component, inject, OnDestroy, OnInit, PLATFORM_ID } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { AuthServices } from '../../../core/services/auth-services/auth-services';
import { ProjectsService } from '../../../core/services/projects-service/projects-service';
import { LoadingService } from '../../../core/services/loading-service/loading-service';
import { ThemeServices } from '../../../core/services/theme-services/theme-services';
import { MyTranslate } from '../../../core/services/my-translate/my-translate';
import { NotificationsService, Notification } from '../../../core/services/notifications-service/notifications-service';

@Component({
  selector: 'app-project-select',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './project-select.html',
  styleUrl: './project-select.css',
})
export class ProjectSelect implements OnInit, OnDestroy {
  private platformId = inject(PLATFORM_ID);
  private cdr = inject(ChangeDetectorRef);
  private loadingService = inject(LoadingService);
  notificationsService = inject(NotificationsService);

  private notifSub?: Subscription;
  private unreadSub?: Subscription;

  user: any = null;
  projects: any[] = [];
  isLoading = true;
  baseUrl = environment.baseUrl;

  notifOpen = false;
  notifications: Notification[] = [];
  unreadCount = 0;

  constructor(
    private authServices: AuthServices,
    private projectsService: ProjectsService,
    private router: Router,
    public themeService: ThemeServices,
    public myTrans: MyTranslate,
  ) {}

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.user = this.authServices.getUser();
      if (!this.user?._id) {
        this.router.navigate(['/login']);
        return;
      }

      const token = localStorage.getItem('token') || '';
      this.notificationsService.connect(token);
      this.notificationsService.loadNotifications();

      this.notifSub = this.notificationsService.notifications$.subscribe((n) => {
        this.notifications = n;
        this.cdr.detectChanges();
      });
      this.unreadSub = this.notificationsService.unreadCount$.subscribe((c) => {
        this.unreadCount = c;
        this.cdr.detectChanges();
      });

      this.loadingService.show('Loading...');
      this.projectsService.getUserProjects(this.user._id).subscribe({
        next: (res) => {
          this.projects = res.data || [];
          this.loadingService.hide();
          if (this.projects.length === 1) {
            this.selectProject(this.projects[0]);
            return;
          }
          this.isLoading = false;
          this.cdr.detectChanges();
        },
        error: () => {
          this.loadingService.hide();
          this.isLoading = false;
          this.cdr.detectChanges();
        },
      });
    }
  }

  ngOnDestroy() {
    this.notifSub?.unsubscribe();
    this.unreadSub?.unsubscribe();
  }

  toggleNotifications() {
    this.notifOpen = !this.notifOpen;
  }

  onNotifClick(n: Notification) {
    if (!n.isRead) this.notificationsService.markRead(n._id);
  }

  getNotifText(n: Notification, field: 'title' | 'message'): string {
    return this.myTrans.currentLang === 'ar' ? n[field].ar : n[field].en;
  }

  selectProject(project: any) {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('selectedProject', JSON.stringify(project));
    }
    this.router.navigate(['/client/projects', project._id]);
  }

  getPhotoUrl(path: string | null): string {
    return path ? `${this.baseUrl}/${path.replace(/\\/g, '/')}` : '';
  }

  toggleLanguage() {
    this.myTrans.changeLang(this.myTrans.currentLang === 'en' ? 'ar' : 'en');
  }

  logout() {
    this.authServices.logout();
    this.router.navigate(['/login']);
  }
}
