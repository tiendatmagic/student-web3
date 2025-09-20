import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateStudentModalComponent } from './create-student-modal.component';

describe('CreateStudentModalComponent', () => {
  let component: CreateStudentModalComponent;
  let fixture: ComponentFixture<CreateStudentModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CreateStudentModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreateStudentModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
