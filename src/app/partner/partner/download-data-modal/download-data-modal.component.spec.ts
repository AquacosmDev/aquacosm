import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DownloadDataModalComponent } from './download-data-modal.component';

describe('DownloadDataModalComponent', () => {
  let component: DownloadDataModalComponent;
  let fixture: ComponentFixture<DownloadDataModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DownloadDataModalComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DownloadDataModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
