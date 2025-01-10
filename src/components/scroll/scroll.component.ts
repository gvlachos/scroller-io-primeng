import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { ProgressBarModule } from 'primeng/progressbar';
import { Scroller, ScrollerModule } from 'primeng/scroller';
import { filter, map, tap } from 'rxjs';
import { ObserveVisibilityDirective } from '../../directives/intersection-observer/observer-visibility.directive';
import { DefaultLimit, ItemHeight } from '../../model/constants';
import { Quote } from '../../model/data.model';
import { DataSourceApiService } from '../../services/data-source-api.service';

@Component({
  selector: 'app-scroll',
  standalone: true,
  imports: [
    CommonModule,
    ScrollerModule,
    ProgressBarModule,
    ObserveVisibilityDirective,
  ],
  providers: [
    DataSourceApiService
  ],
  templateUrl: './scroll.component.html',
  styleUrl: './scroll.component.scss'
})
export class ScrollComponent {
  readonly scrollerItemSize = ItemHeight;

  @Input() reverse?: boolean;

  private showProgressBarTimeout?: ReturnType<typeof setTimeout>;

  protected firstTimeLoading?: boolean;

  protected infiniteScrollLoading?: boolean;

  protected showProgressBar?: boolean;

  protected nextLoadOnItemId ?: number;

  constructor(protected dataSourceApiService: DataSourceApiService) {
    // set document css variable for scroller
    document.documentElement.style.setProperty('--scroller-item-height', `${ ItemHeight }px`);
  }

  private clear() {
    this.firstTimeLoading = false;
    this.infiniteScrollLoading = false;

    clearTimeout(this.showProgressBarTimeout);
    this.showProgressBarTimeout = setTimeout(() => {
      this.showProgressBar = false;
    }, 600);
  }

  private loading(): boolean {
    return this.dataSourceApiService.response ? !!this.infiniteScrollLoading : !!this.firstTimeLoading;
  }

  private getLoadItemId() : number | undefined {
    const position = -1 * (DefaultLimit - 1);
    return this.dataSourceApiService.itemFromPosition(position)?.id;
  }

  private onFirstTimeLoadingAction(scroller: Scroller | null): boolean {
    if (!this.firstTimeLoading) return true;

    if (!scroller) {
      console.warn('No scroller element provided for first time load');
    } else {
      setTimeout(() => {
        const scrollContainer = scroller.getElementRef().nativeElement;
        scrollContainer.scrollTop = this.reverse ? scrollContainer.scrollHeight : 0;
        this.nextLoadOnItemId = this.getLoadItemId();
      }, 1);

      this.clear();
    }

    return false
  }

  private onInfiniteScrollLoaded(scrollContainer: HTMLDivElement) {
      const lastItemId = this.dataSourceApiService.itemFromPosition(-1)?.id;
      const nextToLastItemId = this.dataSourceApiService.itemFromPosition(-2)?.id;
      const valid = this.nextLoadOnItemId && lastItemId && nextToLastItemId;

      if ( valid && this.reverse) {
        scrollContainer.scrollTop += (lastItemId - nextToLastItemId) * ItemHeight;
        this.nextLoadOnItemId = this.getLoadItemId();
      } else if (valid) {
        this.nextLoadOnItemId = this.getLoadItemId();
      } else {
        console.warn('Last item id', lastItemId, ' next to last item id', nextToLastItemId);
      }
  }

  private loadDataAction(options: Scroller | {itemId: number, itemElement: HTMLDivElement}) {
    const scroller = options instanceof Scroller ? options : null;
    const itemElement = options instanceof Scroller ? null : options.itemElement;

    this.showProgressBar = true;

    this.dataSourceApiService.load().pipe(
      filter(() => this.onFirstTimeLoadingAction(scroller)),
      map(() => {
        const scrollContainer = itemElement
          ? itemElement.closest('.scroller') as HTMLDivElement
          : null;

        if (scrollContainer) {
          return scrollContainer;
        }

        return null;
      }),
      filter(scrollContainer => !!scrollContainer),
      tap(scrollContainer => this.onInfiniteScrollLoaded(scrollContainer)),
    ).subscribe(() => this.clear());
  }

  protected loadData(options: Scroller | {itemId: number, itemElement: HTMLDivElement}) {
    const itemId = options instanceof Scroller ? null : options.itemId;
    const atLoadItem = !!this.nextLoadOnItemId && !!itemId && this.nextLoadOnItemId <= itemId;

    if (this.loading()) return;


    if (this.dataSourceApiService.response && !atLoadItem ) {
      this.showProgressBar = true;
      return;
    }

    this.firstTimeLoading = !this.dataSourceApiService.response;

    this.infiniteScrollLoading = !!this.dataSourceApiService.response && atLoadItem;

    this.loadDataAction(options);
  }

  protected trackByFn(index: number, item: Quote) {
    return item.id;
  }
}
