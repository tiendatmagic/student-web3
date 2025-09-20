import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { initFlowbite } from 'flowbite';

@Component({
  selector: 'app-create-student-modal',
  standalone: false,
  templateUrl: './create-student-modal.component.html',
  styleUrl: './create-student-modal.component.scss'
})
export class CreateStudentModalComponent {
  fullName: string = '';
  studentID: string = '';
  permanentAddress: string = '';
  gender: any = null;
  DateOfBirth: Date | null = null;
  address: string = '';
  isDisabled: boolean = false;

  constructor(public dialogRef: MatDialogRef<CreateStudentModalComponent>, @Inject(MAT_DIALOG_DATA) public data: any) { }

  ngOnInit() {
    initFlowbite();
  }

  ngAfterViewInit() {
    initFlowbite();
  }

  onNoClick() {
    this.dialogRef.close();
  }

  onCreate() {
    if (!this.fullName || !this.studentID || !this.permanentAddress || !this.gender || !this.DateOfBirth) {
      console.error('Error: All required fields must be filled');
      return;
    }

    const formData = {
      fullName: this.fullName,
      studentID: this.studentID,
      gender: this.gender,
      DateOfBirthTime: this.toUnixTimestamp(this.DateOfBirth),
    };
    console.log(formData);
  }

  toUnixTimestamp(date: Date | null): number | null {
    if (!date) return null;
    return Math.floor(date.getTime() / 1000);
  }

}
