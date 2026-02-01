import { Component, Inject, PLATFORM_ID, OnInit } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router'; // أضفنا Router و NavigationEnd
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { initFlowbite } from 'flowbite';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [TranslateModule, RouterOutlet],
  template: `<router-outlet></router-outlet>`,
})
export class App implements OnInit {
  constructor(
    public translate: TranslateService,
    private router: Router, // حقن الـ Router
    @Inject(PLATFORM_ID) private platformId: Object,
  ) {
    this.translate.setDefaultLang('en');
    const initialLang = 'en';
    this.translate.use(initialLang);

    if (isPlatformBrowser(this.platformId)) {
      this.updateHtmlAttributes(initialLang);

      // حل مشكلة الـ Routing: إعادة تفعيل فلو بايت مع كل تغيير صفحة
      this.router.events.pipe(filter((event) => event instanceof NavigationEnd)).subscribe(() => {
        setTimeout(() => initFlowbite(), 100);
      });
    }
  }

  ngOnInit(): void {
    // التفعيل الأول عند تحميل التطبيق
    if (isPlatformBrowser(this.platformId)) {
      initFlowbite();
    }
  }

  toggleLanguage() {
    const nextLang = this.translate.currentLang === 'en' ? 'ar' : 'en';
    this.translate.use(nextLang);

    if (isPlatformBrowser(this.platformId)) {
      this.updateHtmlAttributes(nextLang);
      // إعادة التفعيل لأن تغيير الـ DIR قد يؤثر على أماكن الـ Tooltips والدروب داونز
      setTimeout(() => initFlowbite(), 50);
    }
  }

  private updateHtmlAttributes(lang: string) {
    if (isPlatformBrowser(this.platformId)) {
      document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
      document.documentElement.lang = lang;
    }
  }
}
