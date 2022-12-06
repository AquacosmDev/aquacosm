import { TestBed } from '@angular/core/testing';

import { MesocosmYearDataService } from './mesocosm-year-data.service';

describe('MesocosmYearDataService', () => {
  let service: MesocosmYearDataService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MesocosmYearDataService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
