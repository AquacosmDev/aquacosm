import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LinkVariablesComponent } from './link-variables.component';

describe('LinkVariablesComponent', () => {
  let component: LinkVariablesComponent;
  let fixture: ComponentFixture<LinkVariablesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LinkVariablesComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LinkVariablesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
