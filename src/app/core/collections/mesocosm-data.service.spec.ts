import { TestBed } from '@angular/core/testing';

import { MesocosmDataService } from './mesocosm-data.service';

describe('MesocosmDataService', () => {
  let service: MesocosmDataService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MesocosmDataService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
