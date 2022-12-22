import { TestBed } from '@angular/core/testing';

import { ProfileChartService } from './profile-chart.service';

describe('ProfileChartService', () => {
  let service: ProfileChartService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ProfileChartService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
