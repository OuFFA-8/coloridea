import { Directive, ElementRef, OnInit, inject } from '@angular/core';

@Directive({
  selector: 'video[autoplay]',
  standalone: true,
})
export class AutoplayVideoDirective implements OnInit {
  private el = inject<ElementRef<HTMLVideoElement>>(ElementRef);

  ngOnInit() {
    this.el.nativeElement.play().catch(() => {});
  }
}
