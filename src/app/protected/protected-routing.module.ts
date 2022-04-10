import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardComponent } from './dashboard/dashboard.component';
import { CategoriasComponent } from './pages/categorias/categorias.component';
import { ClientesComponent } from './pages/clientes/clientes.component';
import { LayoutComponent } from './pages/layout/layout.component';
import { ProductsComponent } from './pages/products/products.component';
import { ProveedoresComponent } from './pages/proveedores/proveedores.component';
import { UsersComponent } from './pages/users/users.component';
import { SalesComponent } from './pages/sales/sales.component';
import { UnitsComponent } from './pages/units/units.component';

const routes: Routes = [
  {
    path: '',
    component: LayoutComponent,
    children: [
      {path: '', component: DashboardComponent},
      {path: 'users', component: UsersComponent},
      {path: 'categories', component: CategoriasComponent},
      {path: 'products/category/:id', component: ProductsComponent},
      {path: 'sales', component: SalesComponent},
      {path: 'clients', component: ClientesComponent},
      {path: 'providers', component: ProveedoresComponent},
      {path: 'units', component: UnitsComponent},
      {path: '**', redirectTo: ''},
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ProtectedRoutingModule { }
