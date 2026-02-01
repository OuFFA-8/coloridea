import { isPlatformBrowser } from '@angular/common';
import { Inject, Injectable, PLATFORM_ID, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ThemeServices {
  isDarkMode = signal<boolean>(false);

  constructor(@Inject(PLATFORM_ID) private platId: object) {
    if (isPlatformBrowser(this.platId)) {
      // 2. بنشوف هل فيه اختيار "صريح" متخزن في الـ localStorage؟
      const savedTheme = localStorage.getItem('theme');
      if (
        savedTheme === 'dark' ||
        (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)
      ) {
        this.setDarkMode();
      } else {
        this.setLightMode();
      }
    }
  }

  toggleTheme() {
    this.isDarkMode() ? this.setLightMode() : this.setDarkMode();
  }

  private setDarkMode() {
    this.isDarkMode.set(true);
    if (isPlatformBrowser(this.platId)) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    }
  }

  private setLightMode() {
    this.isDarkMode.set(false);
    if (isPlatformBrowser(this.platId)) {
      const html = document.documentElement;
      const body = document.body;

      html.classList.remove('dark');
      body.classList.remove('dark');

      // سطر أمان إضافي
      html.removeAttribute('data-theme');

      localStorage.setItem('theme', 'light');
    }
  }
}
