import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DownloadProfileModalComponent } from './download-profile-modal.component';

describe('DownloadProfileModalComponent', () => {
  let component: DownloadProfileModalComponent;
  let fixture: ComponentFixture<DownloadProfileModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DownloadProfileModalComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DownloadProfileModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
