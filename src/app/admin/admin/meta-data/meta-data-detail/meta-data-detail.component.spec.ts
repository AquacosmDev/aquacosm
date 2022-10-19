import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MetaDataDetailComponent } from './meta-data-detail.component';

describe('MetaDataDetailComponent', () => {
  let component: MetaDataDetailComponent;
  let fixture: ComponentFixture<MetaDataDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MetaDataDetailComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MetaDataDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
