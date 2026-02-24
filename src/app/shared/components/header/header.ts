import { Component, inject, OnInit, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common'; // مهم جداً عشان الـ Pipes والـ Directives
import { TranslateModule } from '@ngx-translate/core'; // عشان الـ Pipe بتاع الترجمة يشتغل
import { MyTranslate } from '../../../core/services/my-translate/my-translate';
import { ThemeServices } from '../../../core/services/theme-services/theme-services';
import { Router, RouterLink } from '@angular/router';
import { environment } from '../../../../environments/environment';
import { AuthServices } from '../../../core/services/auth-services/auth-services';

@Component({
  selector: 'app-header',
  standalone: true, // تأكد إنها موجودة لو بتستخدم الإصدارات الحديثة
  imports: [
    CommonModule, // عشان تقدر تستخدم الـ {{ }} والـ pipes براحتك
    TranslateModule,
    RouterLink,
  ],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header implements OnInit {
  private platformId = inject(PLATFORM_ID);
  user: any = null;
  baseUrl = environment.baseUrl;
  dropdownOpen = false;

  constructor(
    public themeService: ThemeServices,
    public myTrans: MyTranslate,
    private authServices: AuthServices,
    private router: Router,
  ) {}

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.user = this.authServices.getUser();
    }
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
  }

  logout() {
    this.authServices.logout();
    this.dropdownOpen = false;
    this.router.navigate(['/login']);
  }
}
