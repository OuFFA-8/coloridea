import { isPlatformBrowser } from '@angular/common';
import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Injectable({
  providedIn: 'root',
})
export class MyTranslate {
  constructor(
    private translateService: TranslateService,
    @Inject(PLATFORM_ID) private platId: object,
  ) {
    if (isPlatformBrowser(this.platId)) {
      this.translateService.setDefaultLang('en');

      // لو مفيش لغة متسجلة، استخدم الإنجليزية كافتراضي
      const savedLang = localStorage.getItem('lang') || 'en';

      this.changeLang(savedLang); // استدعينا changeLang عشان تظبط الـ dir والـ localStorage مرة واحدة
    }
  }

  // تعديل: بنمرر اللغة للدالة بدل ما نقرأها من localStorage كل شوية
  private changeDirection(lang: string): void {
    if (isPlatformBrowser(this.platId)) {
      document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
      document.documentElement.lang = lang;
    }
  }

  changeLang(lang: string): void {
    if (isPlatformBrowser(this.platId)) {
      localStorage.setItem('lang', lang);
      this.translateService.use(lang);
      this.changeDirection(lang);
    }
  }

  // دالة مساعدة عشان تعرف اللغة الحالية في الهيدر
  get currentLang(): string {
    return this.translateService.currentLang || 'en';
  }
}
