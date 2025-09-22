import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { initFlowbite } from 'flowbite';
import { Web3Service } from '../../services/web3.service';

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

  constructor(public dialogRef: MatDialogRef<CreateStudentModalComponent>, @Inject(MAT_DIALOG_DATA) public data: any, private web3Service: Web3Service) { }

  ngOnInit() {
    initFlowbite();
  }

  ngAfterViewInit() {
    initFlowbite();
  }

  onNoClick() {
    this.dialogRef.close();
  }

  async onCreate() {
    if (!this.fullName || !this.studentID || !this.permanentAddress || this.gender == null || !this.DateOfBirth) {
      console.error('Error: All required fields must be filled');
      return;
    }

    const formData = {
      fullName: this.fullName,
      studentID: this.studentID,
      permanentAddress: this.permanentAddress,
      gender: this.gender,
      DateOfBirthTime: this.toUnixTimestamp(this.DateOfBirth),
    };
    await this.web3Service.addStudentFunc(this.studentID, this.fullName, formData.DateOfBirthTime, this.gender, this.permanentAddress);
  }

  toUnixTimestamp(date: Date | null): number | null {
    if (!date) return null;
    return Math.floor(date.getTime() / 1000);
  }

}
