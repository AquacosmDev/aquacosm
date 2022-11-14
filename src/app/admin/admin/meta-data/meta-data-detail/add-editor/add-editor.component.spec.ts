import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddEditorComponent } from './add-editor.component';

describe('AddEditorComponent', () => {
  let component: AddEditorComponent;
  let fixture: ComponentFixture<AddEditorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddEditorComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AddEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
