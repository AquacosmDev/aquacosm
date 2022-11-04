import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PartnerMetadataComponent } from './partner-metadata.component';

describe('PartnerMetadataComponent', () => {
  let component: PartnerMetadataComponent;
  let fixture: ComponentFixture<PartnerMetadataComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PartnerMetadataComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PartnerMetadataComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
