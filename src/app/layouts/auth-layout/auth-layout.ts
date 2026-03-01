import { Component, inject, OnDestroy, OnInit, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-auth-layout',
  imports: [CommonModule, RouterOutlet],
  templateUrl: './auth-layout.html',
  styleUrl: './auth-layout.css',
})
export class AuthLayout implements OnInit, OnDestroy {
  private platformId = inject(PLATFORM_ID);
  private themeObserver?: MutationObserver;

  isDark = true;

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.detectTheme();
      this.themeObserver = new MutationObserver(() => this.detectTheme());
      this.themeObserver.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ['class'],
      });
    }
  }

  detectTheme() {
    this.isDark = document.documentElement.classList.contains('dark');
  }

  ngOnDestroy() {
    this.themeObserver?.disconnect();
  }
}
