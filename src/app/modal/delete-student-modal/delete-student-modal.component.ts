import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { initFlowbite } from 'flowbite';
import { Web3Service } from '../../services/web3.service';

@Component({
  selector: 'app-delete-student-modal',
  standalone: false,
  templateUrl: './delete-student-modal.component.html',
  styleUrl: './delete-student-modal.component.scss'
})
export class DeleteStudentModalComponent {
  datas: any;
  id: any;
  fullName: any;
  studentID: any;

  constructor(public dialogRef: MatDialogRef<DeleteStudentModalComponent>, @Inject(MAT_DIALOG_DATA) public data: any, private web3Service: Web3Service) {
  }

  ngOnInit() {
    this.datas = this.data.item;
    this.id = this.datas.id;
    this.fullName = this.datas.fullName;
    this.studentID = this.datas.studentId;
    initFlowbite();
  }

  ngAfterViewInit() {
    initFlowbite();
  }

  onNoClick() {
    this.dialogRef.close();
  }

  async onDelete() {
    await this.web3Service.deleteFunc(this.id);
    this.dialogRef.close(this.id);
  }
}
