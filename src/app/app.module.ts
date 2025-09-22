import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HeaderComponent } from './layout/header/header.component';
import { MainComponent } from './layout/main/main.component';
import { FooterComponent } from './layout/footer/footer.component';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { MAT_DATE_LOCALE, MAT_RIPPLE_GLOBAL_OPTIONS, MatRippleModule, RippleGlobalOptions } from '@angular/material/core';
import { ReactiveFormsModule, FormsModule, Validators } from '@angular/forms';
import { MatTabsModule } from '@angular/material/tabs';
import { NotifyModalComponent } from './modal/notify-modal/notify-modal.component';
import { MatIconModule } from '@angular/material/icon';
import { HttpClient, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { HomeComponent } from './page/home/home.component';
import { ContactComponent } from './page/contact/contact.component';
import { TutorialComponent } from './page/tutorial/tutorial.component';
import { CreateStudentModalComponent } from './modal/create-student-modal/create-student-modal.component';
import { CdkObserveContent } from "@angular/cdk/observers";
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatTimepickerModule } from '@angular/material/timepicker';
import { MatRadioModule } from '@angular/material/radio';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { provideNativeDateAdapter } from '@angular/material/core';
import { EditStudentModalComponent } from './modal/edit-student-modal/edit-student-modal.component';
import { DatePipe } from '@angular/common';
import { DeleteStudentModalComponent } from './modal/delete-student-modal/delete-student-modal.component';



const globalRippleConfig: RippleGlobalOptions = {
  animation: {
    enterDuration: 500,
    exitDuration: 0
  }
};

@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    MainComponent,
    FooterComponent,
    NotifyModalComponent,
    HomeComponent,
    ContactComponent,
    TutorialComponent,
    CreateStudentModalComponent,
    EditStudentModalComponent,
    DeleteStudentModalComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    MatSnackBarModule,
    MatTooltipModule,
    MatRippleModule,
    ReactiveFormsModule,
    FormsModule,
    MatTabsModule,
    MatIconModule,
    MatDatepickerModule,
    MatTimepickerModule,
    MatRadioModule,
    CdkObserveContent,
    MatFormFieldModule,
    MatInputModule
  ],
  providers: [DatePipe,
    provideNativeDateAdapter(),
    {
      provide: MAT_RIPPLE_GLOBAL_OPTIONS, useValue: globalRippleConfig
    },
    {
      provide: MAT_DATE_LOCALE, useValue: 'vi-VN'
    },
    provideAnimationsAsync(),
    provideHttpClient(withInterceptorsFromDi())
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
