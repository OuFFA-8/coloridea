import { Component, inject, OnDestroy, OnInit, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { LoadingService } from '../../../core/services/loading-service/loading-service';

@Component({
  selector: 'app-loading-screen',
  imports: [CommonModule],
  templateUrl: './loading-screen.html',
  styleUrl: './loading-screen.css',
})
export class LoadingScreen implements OnInit, OnDestroy {
  public loadingService = inject(LoadingService);
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
