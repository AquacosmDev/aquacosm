import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProfileChartComponent } from './profile-chart.component';

describe('ProfileChartComponent', () => {
  let component: ProfileChartComponent;
  let fixture: ComponentFixture<ProfileChartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ProfileChartComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ProfileChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
