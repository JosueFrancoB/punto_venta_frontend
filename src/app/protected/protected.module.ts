import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ProtectedRoutingModule } from './protected-routing.module';
import { DashboardComponent } from './dashboard/dashboard.component';
import { NbActionsModule, NbAlertModule, NbButtonModule, NbCardModule, NbCheckboxModule, NbFormFieldModule, NbIconModule, NbInputModule, NbLayoutModule, NbMenuModule, NbSidebarModule, NbUserModule } from '@nebular/theme';
import { NbAuthModule } from '@nebular/auth';
import { ReactiveFormsModule } from '@angular/forms';
import { UsersComponent } from './pages/users/users.component';
import { ProductsComponent } from './pages/products/products.component';
import { LayoutComponent } from './pages/layout/layout.component';


@NgModule({
  declarations: [
    DashboardComponent,
    UsersComponent,
    ProductsComponent,
    LayoutComponent
  ],
  imports: [
    CommonModule,
    ProtectedRoutingModule,
    NbCardModule,
    NbUserModule,
    NbActionsModule,
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
