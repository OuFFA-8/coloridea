import { Directive, ElementRef, NgZone, OnDestroy, OnInit, inject } from '@angular/core';

@Directive({
  selector: 'video[autoplay]',
  standalone: true,
})
export class AutoplayVideoDirective implements OnInit, OnDestroy {
  private el = inject<ElementRef<HTMLVideoElement>>(ElementRef);
  private ngZone = inject(NgZone);

  private cleanupFns: (() => void)[] = [];

  ngOnInit() {
    const v = this.el.nativeElement;
    // Set as property — the HTML attribute alone is not always respected by Chrome
    v.muted = true;

    this.ngZone.runOutsideAngular(() => {
      // Fallback: retry when the browser signals it can play
      const onCanPlay = () => this.tryPlay();
      v.addEventListener('canplay', onCanPlay, { once: true });
      this.cleanupFns.push(() => v.removeEventListener('canplay', onCanPlay));

      // Primary attempt
      this.tryPlay();
    });
  }

  ngOnDestroy() {
    this.cleanupFns.forEach(fn => fn());
    this.cleanupFns = [];
  }

  private tryPlay() {
    const v = this.el.nativeElement;
    v.muted = true;
    v.play().catch(() => {
      // play() was blocked (e.g. Chrome autoplay policy in some configurations).
      // Retry on the next user gesture — this covers the case where the video is
      // created by a timer (no active gesture) but the user later interacts with
      // the page (click, keydown, touchstart).
      const retry = () => {
        v.muted = true;
        v.play().catch(() => {});
      };
      const opts: AddEventListenerOptions = { once: true, capture: true };
      document.addEventListener('click', retry, opts);
      document.addEventListener('keydown', retry, opts);
      document.addEventListener('touchstart', retry, opts);
      this.cleanupFns.push(
        () => document.removeEventListener('click', retry, true),
        () => document.removeEventListener('keydown', retry, true),
        () => document.removeEventListener('touchstart', retry, true),
      );
    });
  }
}
