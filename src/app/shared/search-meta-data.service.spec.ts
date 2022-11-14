import { TestBed } from '@angular/core/testing';

import { SearchMetaDataService } from './search-meta-data.service';

describe('SearchMetaDataService', () => {
  let service: SearchMetaDataService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SearchMetaDataService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
