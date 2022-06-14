import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VariableChartComponent } from './variable-chart.component';

describe('VariableChartComponent', () => {
  let component: VariableChartComponent;
  let fixture: ComponentFixture<VariableChartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ VariableChartComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(VariableChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
