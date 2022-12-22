import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PartnerProfilesComponent } from './partner-profiles.component';

describe('PartnerProfilesComponent', () => {
  let component: PartnerProfilesComponent;
  let fixture: ComponentFixture<PartnerProfilesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PartnerProfilesComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PartnerProfilesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
