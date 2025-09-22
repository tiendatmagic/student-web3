import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { initFlowbite } from 'flowbite';
import { Web3Service } from '../../services/web3.service';

@Component({
  selector: 'app-edit-student-modal',
  standalone: false,
  templateUrl: './edit-student-modal.component.html',
  styleUrl: './edit-student-modal.component.scss'
})
export class EditStudentModalComponent {
  fullName: string = '';
  studentID: string = '';
  permanentAddress: string = '';
  gender: any = null;
  DateOfBirth: Date | null = null;
  address: string = '';
  isDisabled: boolean = false;
  datas: any;
  isCreator = false;
  id: any;

  constructor(public dialogRef: MatDialogRef<EditStudentModalComponent>, @Inject(MAT_DIALOG_DATA) public data: any, private web3Service: Web3Service) {
  }

  ngOnInit() {
    this.datas = this.data.item;
    this.web3Service.account$.subscribe((account: any) => {
      if (String(account).toLowerCase() == String(this.datas.creator).toLowerCase()) {
        this.isCreator = true;
      }
      else {
        this.isCreator = false;
      }
    })
    this.id = this.datas.id;
    this.fullName = this.datas.fullName;
    this.studentID = this.datas.studentId;
    this.permanentAddress = this.datas.permanentAddress;
    this.gender = Number(this.datas.gender);
    this.DateOfBirth = new Date(this.datas.dateOfBirth * 1000);
    initFlowbite();
  }

  ngAfterViewInit() {
    initFlowbite();
  }

  onNoClick() {
    this.dialogRef.close();
  }

  async onEdit() {
    if (this.id == null || !this.fullName || !this.studentID || !this.permanentAddress || this.gender == null || !this.DateOfBirth) {
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
    await this.web3Service.updateStudentFunc(this.id, this.studentID, this.fullName, formData.DateOfBirthTime, this.gender, this.permanentAddress);
  }

  toUnixTimestamp(date: Date | null): number | null {
    if (!date) return null;
    return Math.floor(date.getTime() / 1000);
  }

}
