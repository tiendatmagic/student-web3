import { Component } from '@angular/core';
import { Web3Service } from '../../services/web3.service';

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
  constructor(private web3Service: Web3Service) {
    this.web3Service.studentData$.subscribe((data: any) => {
      this.studentData = data;
    })
  }

  async ngOnInit() {
    var abc = await this.getData(this.id);
  }

  async prevPage() {
    if (this.studentData.length == 0) {
      return;
    }
    if (this.page > 1) {
      this.page -= 1;
      var data: any = await this.getData(this.id);
      if (!data?.length) {
        this.page--;
        await this.getData(this.id);
      }
    }
  }


  async nextPage() {
    console.log(this.studentData.length);
    if (this.studentData.length < 10) {
      return;
    }

    this.page += 1;

    var data: any = await this.getData(this.id);
    if (!data?.length) {
      this.page--;
      await this.getData(this.id);
    }
  }

  async getData(pageNumber = this.page) {
    var data: any = await this.web3Service.getDataFunc(pageNumber);

    if (!data || data.length === 0) {
      this.studentData = null;
      return;
    }

    this.studentData = data.map((item: any) => {
      return {
        id: Number(item[0]),
        studentId: item[1],
        fullName: item[2],
        gender: item[3] === "1" ? "Male" : "Female",
        dateOfBirth: item[4],
        address: item[5],
      };
    });

    console.log("Student list:", this.studentData);
  }

  async deleteStudent(id: number) {
    await this.web3Service.deleteFunc(id);
    await this.getData();
  }


  test() {
    this.web3Service.checkInFunc(1);
    this.web3Service.getTokenBalanceFunc('0x1ad11e0e96797a14336bf474676eb0a332055555')
  }
}
