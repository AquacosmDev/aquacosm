import { TestBed } from '@angular/core/testing';

import { LastUploadTimeService } from './last-upload-time.service';

describe('LastUploadTimeService', () => {
  let service: LastUploadTimeService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LastUploadTimeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
