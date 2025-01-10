import { Directive, OnDestroy, OnInit, AfterViewInit, Input, Output, EventEmitter, ElementRef } from "@angular/core";
import { Subject, delay, filter } from "rxjs";

@Directive({
  selector: '[observeVisibility]',
  standalone: true,
})
export class ObserveVisibilityDirective implements OnDestroy, OnInit, AfterViewInit {
  @Input({ required: true }) observerId!: string | number;
  @Input() debounceTime = 0; // ms
  @Input() threshold = 1;

  @Output() visible = new EventEmitter<HTMLElement>();

  private observer: IntersectionObserver | undefined;

  private visibility = new Subject<null | {
    entry: IntersectionObserverEntry;
    observer: IntersectionObserver;
  }>();

  constructor(private element: ElementRef) {}

  ngOnInit() {
    this.createObserver();
  }

  ngAfterViewInit() {
    this.startObservingElements();
  }

  ngOnDestroy() {
    if (this.observer) {
      this.observer.disconnect();
      this.observer = undefined;
    }

    this.visibility.next(null);
    this.visibility.complete();
  }

  private createObserver() {
    const options = {
      rootMargin: '0px',
      threshold: this.threshold,
    };

    const isIntersecting = (entry: IntersectionObserverEntry) =>
      entry.isIntersecting || entry.intersectionRatio > 0;

    this.observer = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (isIntersecting(entry)) {
          this.visibility.next({ entry, observer });
        }
      });
    }, options);
  }

  private startObservingElements() {
    if (!this.observer) {
      return;
    }

    this.observer.observe(this.element.nativeElement);

    this.visibility.pipe(
      delay(this.debounceTime),
      filter(Boolean)
    ).subscribe(async ({ entry, observer }) => {
        const target = entry.target as HTMLElement;
        const isStillVisible = await this.isVisible(target);

        if (isStillVisible) {
          this.visible.emit(target);
          observer.unobserve(target);
        }
      });
  }

  private isVisible(element: HTMLElement) {
    return new Promise(resolve => {
      const observer = new IntersectionObserver(([entry]) => {
        resolve(entry.intersectionRatio === 1);
        observer.disconnect();
      });

      observer.observe(element);
    });
  }
}
