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
import { PerfilComponent } from './perfil/perfil.component';
import { PurchasesComponent } from './pages/purchases/purchases.component';

const routes: Routes = [
  {
    path: '',
    component: LayoutComponent,
    children: [
      {path: '', component: DashboardComponent},
      {path: 'users', component: UsersComponent},
      {path: 'categories', component: CategoriasComponent},
      {path: 'products/category/:id', component: ProductsComponent},
      {path: 'purchases', component: PurchasesComponent},
      {path: 'sales', component: SalesComponent},
      {path: 'clients', component: ClientesComponent},
      {path: 'providers', component: ProveedoresComponent},
      {path: 'units', component: UnitsComponent},
      {path: 'perfil', component: PerfilComponent},
      {path: '**', redirectTo: ''},
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ProtectedRoutingModule { }
