import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ProtectedRoutingModule } from './protected-routing.module';
import { DashboardComponent } from './dashboard/dashboard.component';
import { NbAlertModule, NbButtonModule, NbCardModule, NbCheckboxModule, NbFormFieldModule, NbIconModule, NbInputModule, NbLayoutModule, NbMenuModule, NbSidebarModule } from '@nebular/theme';
import { NbAuthModule } from '@nebular/auth';
import { ReactiveFormsModule } from '@angular/forms';
import { UsersComponent } from './users/users.component';


@NgModule({
  declarations: [
    DashboardComponent,
    UsersComponent
  ],
  imports: [
    CommonModule,
    ProtectedRoutingModule,
    NbCardModule,
    NbLayoutModule,
    NbFormFieldModule,
    NbInputModule,
    NbIconModule,
    NbAuthModule,
    NbAlertModule,
    NbButtonModule, 
    ReactiveFormsModule,
    NbCheckboxModule,
    NbIconModule,
    NbSidebarModule.forRoot(),
    NbMenuModule.forRoot(),
  ]
})
export class ProtectedModule { }
