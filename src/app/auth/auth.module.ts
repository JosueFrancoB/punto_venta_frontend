import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

import { NbAuthModule } from '@nebular/auth';
import { AuthRoutingModule } from './auth-routing.module';
import { LoginComponent } from './pages/login/login.component';
import { RegisterComponent } from './pages/register/register.component';
import { MainComponent } from './pages/main/main.component';
import { NbAlertModule, NbButtonModule, NbCardModule, NbCheckboxModule, NbFormFieldModule, NbIconModule, NbInputModule, NbLayoutModule } from '@nebular/theme';


@NgModule({
  declarations: [
    LoginComponent,
    RegisterComponent,
    MainComponent
  ],
  imports: [
    CommonModule,
    AuthRoutingModule,
    NbCardModule,
    NbLayoutModule,
    NbFormFieldModule,
    NbInputModule,
    NbIconModule,
    NbAuthModule,
    NbAlertModule,
    NbButtonModule, 
    ReactiveFormsModule,
    NbCheckboxModule
  ]
})
export class AuthModule { }
