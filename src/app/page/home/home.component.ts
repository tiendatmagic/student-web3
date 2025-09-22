import { Component } from '@angular/core';
import { Web3Service } from '../../services/web3.service';
import { MatDialog } from '@angular/material/dialog';
import { CreateStudentModalComponent } from '../../modal/create-student-modal/create-student-modal.component';
import { EditStudentModalComponent } from '../../modal/edit-student-modal/edit-student-modal.component';
import { DeleteStudentModalComponent } from '../../modal/delete-student-modal/delete-student-modal.component';

@Component({
  selector: 'app-home',
  standalone: false,
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent {
  id: any;
  studentData: any;
  page: number = 1;
  sort: number = 1;
  constructor(private web3Service: Web3Service, public dialog: MatDialog) {
    this.web3Service.studentData$.subscribe((data: any) => {
      this.studentData = data;
    })
  }

  async ngOnInit() {
    var abc = await this.getData();
  }

  async prevPage() {
    if (this.studentData.length == 0) {
      return;
    }
    if (this.page > 1) {
      this.page -= 1;
      var data: any = await this.getData();
      if (!data?.length) {
        this.page--;
        await this.getData();
      }
    }
  }


  async nextPage() {
    if (this.studentData.length < 10) {
      return;
    }

    this.page += 1;

    var data: any = await this.getData();
    if (!data?.length) {
      this.page--;
      await this.getData();
    }
  }

  async getData(pageNumber = this.page, sort = this.sort) {
    var data: any = await this.web3Service.getDataFunc(pageNumber, sort);
    if (!data || data.length === 0) {
      this.studentData = null;
      return;
    }
  }

  async deleteStudent(item: any) {
    this.dialog.open(DeleteStudentModalComponent, {
      disableClose: true,
      width: '90%',
      maxWidth: '500px',
      data: { item },
    });
  }
  async editStudent(item: any) {
    this.dialog.closeAll();
    this.dialog.open(EditStudentModalComponent, {
      disableClose: true,
      width: '90%',
      maxWidth: '768px',
      data: { item },
    });
  }

  onCreate() {
    this.dialog.closeAll();
    this.dialog.open(CreateStudentModalComponent, {
      disableClose: true,
      width: '90%',
      maxWidth: '768px',
    });
  }


  async onSort(event: any) {
    const type = event.target.value;
    this.sort = type;
    await this.getData(this.page, this.sort);
  }

  test() {
    this.web3Service.checkInFunc(1);
    this.web3Service.getTokenBalanceFunc('0x1ad11e0e96797a14336bf474676eb0a332055555')
  }
}
