import { TestBed } from '@angular/core/testing';

import { MesocosmService } from './mesocosm.service';

describe('MesocosmService', () => {
  let service: MesocosmService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MesocosmService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
