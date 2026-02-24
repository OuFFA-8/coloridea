import { Component, Inject, PLATFORM_ID, OnInit } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import {
  RouterOutlet,
  Router,
  NavigationEnd,
  NavigationStart,
  NavigationCancel,
  NavigationError,
} from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { initFlowbite } from 'flowbite';
import { filter } from 'rxjs/operators';
import { LoadingService } from './core/services/loading-service/loading-service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [TranslateModule, RouterOutlet],
  template: `<router-outlet></router-outlet>`,
})
export class App implements OnInit {
  constructor(
    public translate: TranslateService,
    private router: Router,
    public loadingService: LoadingService,
    @Inject(PLATFORM_ID) private platformId: Object,
  ) {
    this.translate.setDefaultLang('en');
    const initialLang = 'en';
    this.translate.use(initialLang);

    if (isPlatformBrowser(this.platformId)) {
      this.updateHtmlAttributes(initialLang);

      // Loading على كل navigation
      this.router.events.subscribe((event) => {
        if (event instanceof NavigationStart) {
          this.loadingService.show();
        }
        if (
          event instanceof NavigationEnd ||
          event instanceof NavigationCancel ||
          event instanceof NavigationError
        ) {
          setTimeout(() => this.loadingService.hide(), 400);
        }
      });

      // Flowbite على كل NavigationEnd
      this.router.events.pipe(filter((event) => event instanceof NavigationEnd)).subscribe(() => {
        setTimeout(() => initFlowbite(), 100);
      });
    }
  }

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      initFlowbite();
    }
  }

  toggleLanguage() {
    const nextLang = this.translate.currentLang === 'en' ? 'ar' : 'en';
    this.translate.use(nextLang);
    if (isPlatformBrowser(this.platformId)) {
      this.updateHtmlAttributes(nextLang);
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
