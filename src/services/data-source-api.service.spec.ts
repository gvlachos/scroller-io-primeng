import { TestBed } from '@angular/core/testing';

import { DataSourceApiService } from './data-source-api.service';

describe('DataSourceApiService', () => {
  let service: DataSourceApiService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DataSourceApiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
