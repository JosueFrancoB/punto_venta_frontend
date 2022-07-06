import { Component, OnInit } from '@angular/core';
import { NbMenuItem, NbMenuService, NbSidebarService } from '@nebular/theme';
import { AuthService } from 'src/app/auth/services/auth.service';
import { LayoutService } from '../../services/layout.service';
import { UsersService } from '../../services/users.service';

import { map, filter } from 'rxjs/operators';
import { Router } from '@angular/router';


@Component({
  selector: 'app-layout',
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.scss']
})
export class LayoutComponent implements OnInit {

  toggleSidebar(): boolean {
    this.sidebarService.toggle(true, 'menu-sidebar');
    this.layoutService.changeLayoutSize();
    return false;
  }
  constructor(private readonly sidebarService: NbSidebarService, 
    private layoutService: LayoutService,
    private authService: AuthService,
    private nbMenuService: NbMenuService,
    private usersService: UsersService,
    private router:Router) { }
  

    get usuario(){
      return this.authService.usuario
    }

    userPictureOnly: boolean = false;
    user_rol:string = ''
    userMenu = [ 
    // { title: 'Mi Perfil', icon: 'person-outline', link: '/dashboard/perfil' }, 
    { title: 'Cerrar Sesión', icon: 'log-out-outline' }
    ];


  items: NbMenuItem[] = [
    {
      title: 'Estadísticas',
      icon: 'home-outline',
      link: '/dashboard',
      home: true
    },
    {
      title: 'Usuarios',
      icon: 'people-outline',
      link: '/dashboard/users'
    },
    {
      title: 'Productos',
      icon: 'gift-outline',
      link: '/dashboard/categories'
    },
    {
      title: 'Compras',
      icon: 'shopping-bag-outline',
      link: '/dashboard/purchases'
    },
    {
      title: 'Ventas',
      icon: 'shopping-cart-outline',
      link: '/dashboard/sales'
    },
    {
      title: 'Clientes',
      icon: 'award-outline',
      link: '/dashboard/clients'
    },
    {
      title: 'Proveedores',
      icon: 'car-outline',
      link: '/dashboard/providers'
    },
    {
      title: 'Almacenes',
      icon: 'archive-outline',
      link: '/dashboard/warehouses'
    },
    {
      title: 'Unidades',
      icon: 'cube-outline',
      link: '/dashboard/units'
    }
  ];

  ngOnInit(){
    //TODO: Checar permisos de usuario
    this.getUserRol()
    
    this.nbMenuService.onItemClick()
      .pipe(
        filter(({ tag }) => tag === 'user-menu'),
        map(({ item: { title } }) => title),
      )
      .subscribe(title => {
        console.log(title);
        if (title === 'Cerrar Sesión'){
          this.logout()
        }
      });
  }

  getUserRol(){
    this.usersService.validateJWT().subscribe(res=>{
      if(res.ok && res.ok ===true){
        this.user_rol = res.usuario.rol
        if(this.user_rol === 'Usuario'){
          this.restrictMenu()
        }
      }
    })
  }

  restrictMenu(){
    this.items = this.items.filter(item => item.title != 'Usuarios' && item.title != 'Estadísticas')
  }

  logout(){
    this.router.navigateByUrl('/auth');
    this.authService.logout();
  }
}
