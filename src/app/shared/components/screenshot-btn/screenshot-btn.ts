import { ChangeDetectionStrategy, Component, input, PLATFORM_ID, signal, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-screenshot-btn',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { style: 'display: contents' },
  template: `
    <button
      (click)="capture()"
      [disabled]="busy()"
      title="تصوير الصفحة"
      class="flex items-center gap-2 px-3 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest border cursor-pointer transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed bg-white dark:bg-[#1c1c1c] border-[#e6d5c3] dark:border-[#444547]/40 text-[#5c5f63] dark:text-gray-400 hover:border-[#fa8728] hover:text-[#fa8728] shadow-sm"
    >
      @if (busy()) {
        <svg class="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
        </svg>
        جارٍ...
      } @else {
        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"/>
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"/>
        </svg>
        تصوير
      }
    </button>
  `,
})
export class ScreenshotBtn {
  private platformId = inject(PLATFORM_ID);

  filename = input('screenshot');
  busy = signal(false);

  async capture() {
    if (!isPlatformBrowser(this.platformId) || this.busy()) return;
    this.busy.set(true);

    const isDark = document.documentElement.classList.contains('dark');
    const vh = window.innerHeight;
    const origin = window.location.origin;

    // Overlay hides layout changes from the user while we manipulate the DOM
    const overlay = document.createElement('div');
    overlay.style.cssText = `position:fixed;inset:0;z-index:999999;background:${isDark ? '#0e0e0e' : '#fff1e6'}`;
    document.body.appendChild(overlay);

    type Saved = { el: HTMLElement; bf: string; overflow: string; overflowY: string; height: string; maxHeight: string };
    const saved: Saved[] = [];

    document.querySelectorAll<HTMLElement>('*').forEach((el) => {
      if (el === overlay) return;
      const cs = getComputedStyle(el);
      const bf = cs.backdropFilter;
      const oy = cs.overflowY;
      const ov = cs.overflow;
      const elH = parseFloat(cs.height);
      const isScrollContainer = oy === 'auto' || oy === 'scroll';
      const isLargeHidden = ov === 'hidden' && elH >= vh * 0.8;

      if ((bf && bf !== 'none') || isScrollContainer || isLargeHidden) {
        saved.push({
          el,
          bf: el.style.backdropFilter,
          overflow: el.style.overflow,
          overflowY: el.style.overflowY,
          height: el.style.height,
          maxHeight: el.style.maxHeight,
        });
        if (bf && bf !== 'none') el.style.backdropFilter = 'none';
        if (isScrollContainer || isLargeHidden) {
          el.style.overflow = 'visible';
          el.style.height = 'auto';
          el.style.maxHeight = 'none';
        }
      }
    });

    // Force sync reflow so dimensions settle before we read them
    void document.body.offsetHeight;
    await new Promise<void>((r) => setTimeout(r, 250));

    // Hide overlay + browser-extension nodes so they don't appear in capture
    overlay.style.display = 'none';
    const foreignEls: { el: HTMLElement; vis: string }[] = [];
    document.body.childNodes.forEach((node) => {
      if (node instanceof HTMLElement && node.tagName.toLowerCase() !== 'app-root') {
        foreignEls.push({ el: node, vis: node.style.visibility });
        node.style.visibility = 'hidden';
      }
    });

    try {
      const [{ toPng }, { jsPDF }] = await Promise.all([
        import('html-to-image'),
        import('jspdf'),
      ]);

      const appRoot = document.querySelector<HTMLElement>('app-root') ?? document.body;
      const width = appRoot.offsetWidth || window.innerWidth;
      const height = Math.max(appRoot.scrollHeight, appRoot.offsetHeight);

      console.log('[screenshot] dimensions', { width, height });

      const dataUrl = await toPng(appRoot, {
        skipFonts: true,
        backgroundColor: isDark ? '#0e0e0e' : '#fff1e6',
        pixelRatio: 1,
        width,
        height,
        style: { width: width + 'px', height: height + 'px', overflow: 'visible', maxHeight: 'none' },
        filter: (node: Node) => {
          if (node instanceof HTMLImageElement && node.src) {
            if (node.src.startsWith('data:')) return true;
            try { return new URL(node.src).origin === origin; } catch { return true; }
          }
          return true;
        },
      });

      console.log('[screenshot] dataUrl prefix', dataUrl?.substring(0, 60));

      const pdf = new jsPDF({
        orientation: width > height ? 'landscape' : 'portrait',
        unit: 'px',
        format: [width, height],
        compress: true,
      });
      pdf.addImage(dataUrl, 'PNG', 0, 0, width, height);
      pdf.save(`${this.filename()}-${new Date().toISOString().slice(0, 10)}.pdf`);
    } catch (err) {
      console.error('[screenshot] FAILED:', err);
    } finally {
      saved.forEach(({ el, bf, overflow, overflowY, height, maxHeight }) => {
        el.style.backdropFilter = bf;
        el.style.overflow = overflow;
        el.style.overflowY = overflowY;
        el.style.height = height;
        el.style.maxHeight = maxHeight;
      });
      foreignEls.forEach(({ el, vis }) => (el.style.visibility = vis));
      overlay.remove();
      this.busy.set(false);
    }
  }
}
