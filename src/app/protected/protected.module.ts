import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ProtectedRoutingModule } from './protected-routing.module';
import { DashboardComponent } from './dashboard/dashboard.component';
import { NbAccordionModule, NbActionsModule, NbAlertModule, NbAutocompleteModule, NbBadgeModule, NbButtonGroupModule, NbButtonModule, NbCardModule, NbCheckboxModule, NbContextMenuModule, NbDatepickerModule, NbDialogModule, NbFormFieldModule, NbIconModule, NbInputModule, NbLayoutModule, NbListModule, NbMenuModule, NbPopoverModule, NbRadioModule, NbSearchModule, NbSelectModule, NbSidebarModule, NbSpinnerModule, NbStepperModule, NbTabsetModule, NbTagModule, NbToggleModule, NbTooltipModule, NbUserModule } from '@nebular/theme';
import { NbAuthModule } from '@nebular/auth';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { UsersComponent } from './pages/users/users.component';
import { ProductsComponent } from './pages/products/products.component';
import { LayoutComponent } from './pages/layout/layout.component';
import { Ng2SmartTableModule } from 'ng2-smart-table';
import { CategoriasComponent } from './pages/categorias/categorias.component';
import { ClientesComponent } from './pages/clientes/clientes.component';
import { ProveedoresComponent } from './pages/proveedores/proveedores.component';
import {NgxDropzoneModule} from 'ngx-dropzone';
import { Ng2SearchPipeModule } from 'ng2-search-filter';
import { UnitsComponent } from './pages/units/units.component';
import { SalesComponent } from './pages/sales/sales.component';
import { PerfilComponent } from './perfil/perfil.component';
import { JwPaginationComponent, JwPaginationModule } from 'jw-angular-pagination';
import { SwiperModule } from 'swiper/angular';
import { PurchasesComponent } from './pages/purchases/purchases.component';
import { WarehousesComponent } from './pages/warehouses/warehouses.component';
import { InputSearchComponent } from './components/input-search/input-search.component';

@NgModule({
  declarations: [
    DashboardComponent,
    UsersComponent,
    ProductsComponent,
    LayoutComponent,
    CategoriasComponent,
    ClientesComponent,
    ProveedoresComponent,
    UnitsComponent,
    SalesComponent,
    PerfilComponent,
    PurchasesComponent,
    WarehousesComponent,
    InputSearchComponent
  ],
  imports: [
    CommonModule,
    JwPaginationModule,
    ProtectedRoutingModule,
    NbBadgeModule,
    NbButtonGroupModule,
    NbPopoverModule,
    NbAccordionModule,
    NbTagModule,
    SwiperModule,
    NbCardModule,
    NbRadioModule,
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
    Ng2SmartTableModule,
    NbContextMenuModule,
    NbDatepickerModule.forRoot(),
    NbSidebarModule.forRoot(),
    NbMenuModule.forRoot(),
    NbDialogModule.forChild(),
    NbSelectModule,
    NbToggleModule,
    NbTooltipModule,
    NbSpinnerModule,
    NbSearchModule,
    NbAutocompleteModule,
    NgxDropzoneModule,
    FormsModule,
    Ng2SearchPipeModule,
    NbTabsetModule,
    NbStepperModule,
    NbListModule,
    FormsModule
  ]
})
export class ProtectedModule { }
