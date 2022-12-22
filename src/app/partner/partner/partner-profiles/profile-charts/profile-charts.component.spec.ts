import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProfileChartsComponent } from './profile-charts.component';

describe('ProfileChartsComponent', () => {
  let component: ProfileChartsComponent;
  let fixture: ComponentFixture<ProfileChartsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ProfileChartsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ProfileChartsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
