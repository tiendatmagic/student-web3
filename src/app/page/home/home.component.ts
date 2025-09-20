import { Component } from '@angular/core';
import { Web3Service } from '../../services/web3.service';
import { MatDialog } from '@angular/material/dialog';
import { CreateStudentModalComponent } from '../../modal/create-student-modal/create-student-modal.component';

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
    console.log(this.studentData.length);
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

  async getData(pageNumber = this.page) {
    var data: any = await this.web3Service.getDataFunc(pageNumber);
    if (!data || data.length === 0) {
      this.studentData = null;
      return;
    }
  }

  async deleteStudent(id: number) {
    await this.web3Service.deleteFunc(id);
    await this.getData();
  }

  onCreate() {
    this.dialog.closeAll();
    this.dialog.open(CreateStudentModalComponent, {
      width: '90%',
      maxWidth: '1280px',
    });
  }


  test() {
    this.web3Service.checkInFunc(1);
    this.web3Service.getTokenBalanceFunc('0x1ad11e0e96797a14336bf474676eb0a332055555')
  }
}
