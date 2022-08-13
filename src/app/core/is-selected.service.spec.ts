import { TestBed } from '@angular/core/testing';

import { IsSelectedService } from './is-selected.service';

describe('IsSelectedService', () => {
  let service: IsSelectedService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(IsSelectedService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
