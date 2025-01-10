import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { catchError, Observable, take, tap } from 'rxjs';
import { DefaultLimit, StartPosition } from '../model/constants';
import { Quote } from '../model/data.model';
import { QuotesResponse } from '../model/response.model';

@Injectable()
export class DataSourceApiService {
  readonly limit = DefaultLimit;
  private skip = StartPosition;

  private htttpClient = inject(HttpClient);
  private url = (limit = this.limit, skip = this.skip) => `https://dummyjson.com/quotes?limit=${ limit }&skip=${ skip }`;

  private _response?: QuotesResponse;
  public set response(value: QuotesResponse | undefined) {
    this._response = value;
  }
  public get response() {
    return this._response;
  }

  private _data: Quote[] = [];

  private _summary = '';
  get summary() {
    return this._summary;
  }

  public load(): Observable<null | QuotesResponse> {
    const limit = this.response
      ?  this.limit
      :  this.limit * 3; // first time

    const url = this.url(limit);


    return this.htttpClient.get<QuotesResponse>(url).pipe(
      take(1),
      tap(response => {
        const hasMore = response.total > response.skip + response.limit;
        this.response = { ...response, hasMore };

        if (this._data.length) {
          this._data = [...this._data, ...response.quotes];
        } else {
          this._data = response.quotes;
        }

        this.skip += limit;

        this._summary = `Showing ${ this.limit } of ${ this._data.length } loaded from ${ this.response.total } total`;
      }),
      catchError(error => {
        console.error(error);
        return [];
      })
    );
  }

  public getData(reverse?: boolean) {
    return reverse ? this._data.reverse() : this._data;
  }

  public itemFromPosition(position: number): Quote | undefined {
    return this._data[this._data.length - 1 + position];
  }

  public findIndexById(id: number) {
    return this._data.findIndex(item => item.id === id);
  }
}
