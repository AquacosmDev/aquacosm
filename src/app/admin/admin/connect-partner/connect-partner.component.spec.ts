import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConnectPartnerComponent } from './connect-partner.component';

describe('ConnectPartnerComponent', () => {
  let component: ConnectPartnerComponent;
  let fixture: ComponentFixture<ConnectPartnerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ConnectPartnerComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ConnectPartnerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
