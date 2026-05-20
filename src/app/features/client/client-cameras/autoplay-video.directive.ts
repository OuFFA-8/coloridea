import { Directive, ElementRef, NgZone, OnDestroy, OnInit, inject } from '@angular/core';

@Directive({
  selector: 'video[autoplay]',
  standalone: true,
})
export class AutoplayVideoDirective implements OnInit, OnDestroy {
  private el = inject<ElementRef<HTMLVideoElement>>(ElementRef);
  private ngZone = inject(NgZone);

  private readonly onCanPlay = () => this.tryPlay();

  ngOnInit() {
    const v = this.el.nativeElement;
    // Setting muted as a property is required for Chrome autoplay to work —
    // the HTML attribute alone is not always respected for programmatic play.
    v.muted = true;
    this.ngZone.runOutsideAngular(() => {
      v.addEventListener('canplay', this.onCanPlay, { once: true });
    });
    this.tryPlay();
  }

  ngOnDestroy() {
    this.el.nativeElement.removeEventListener('canplay', this.onCanPlay);
  }

  private tryPlay() {
    const v = this.el.nativeElement;
    v.muted = true;
    v.play().catch(() => {});
  }
}
