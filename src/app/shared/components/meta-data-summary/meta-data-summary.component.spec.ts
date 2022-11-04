import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MetaDataSummaryComponent } from './meta-data-summary.component';

describe('MetaDataSummaryComponent', () => {
  let component: MetaDataSummaryComponent;
  let fixture: ComponentFixture<MetaDataSummaryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MetaDataSummaryComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MetaDataSummaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
