import { TestBed } from '@angular/core/testing';

import { MetaDataEditorService } from './meta-data-editor.service';

describe('MetaDataEditorService', () => {
  let service: MetaDataEditorService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MetaDataEditorService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
