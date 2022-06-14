import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TimeRangeSelectorComponent } from './time-range-selector.component';

describe('TimeRangeSelectorComponent', () => {
  let component: TimeRangeSelectorComponent;
  let fixture: ComponentFixture<TimeRangeSelectorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TimeRangeSelectorComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TimeRangeSelectorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
