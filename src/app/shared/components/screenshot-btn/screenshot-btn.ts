import { ChangeDetectionStrategy, Component, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-screenshot-btn',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { style: 'display: contents' },
  template: `
    <button
      (click)="print()"
      title="طباعة الصفحة"
      class="flex items-center gap-2 px-3 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest border cursor-pointer transition-all duration-300 bg-white dark:bg-[#1c1c1c] border-[#e6d5c3] dark:border-[#444547]/40 text-[#5c5f63] dark:text-gray-400 hover:border-[#fa8728] hover:text-[#fa8728] shadow-sm"
    >
      <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
          d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"/>
      </svg>
      طباعة
    </button>
  `,
})
export class ScreenshotBtn {
  private platformId = inject(PLATFORM_ID);

  print() {
    if (!isPlatformBrowser(this.platformId)) return;
    window.print();
  }
}
