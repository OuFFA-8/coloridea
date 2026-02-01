import { Component, signal, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common'; // استيراد التأكد من المنصة
import { RouterOutlet } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [TranslateModule, RouterOutlet],
  template: ` <router-outlet></router-outlet> `,
})
export class App {
  constructor(
    public translate: TranslateService,
    @Inject(PLATFORM_ID) private platformId: Object, // حقن معرف المنصة
  ) {
    this.translate.setDefaultLang('en');

    // بنخلي السيرفر يختار اللغة، بس المتصفح هو اللي يغير الـ DOM
    const initialLang = 'en';
    this.translate.use(initialLang);

    // التأكد إننا في المتصفح قبل ما نغير اتجاه الصفحة
    if (isPlatformBrowser(this.platformId)) {
      this.updateHtmlAttributes(initialLang);
    }
  }

  toggleLanguage() {
    const nextLang = this.translate.currentLang === 'en' ? 'ar' : 'en';
    this.translate.use(nextLang);

    if (isPlatformBrowser(this.platformId)) {
      this.updateHtmlAttributes(nextLang);
    }
  }

  // فصلنا كود الـ document في دالة لوحدها
  private updateHtmlAttributes(lang: string) {
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
  }
}
