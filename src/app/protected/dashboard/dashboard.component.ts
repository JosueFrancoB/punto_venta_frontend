import { Component} from '@angular/core';
import { Router } from '@angular/router';
import { NbMenuItem, NbSidebarService } from '@nebular/theme';
import { AuthService } from 'src/app/auth/services/auth.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styles: [
  `
  .sidebar-toggle {
    padding-right: 1.25rem;
    text-decoration: none;
    color: var(--text-hint-color);
    font-size: 3.5rem;
  }
  `
  ]
})
export class DashboardComponent {

  get usuario(){
    return this.authService.usuario
  }

  constructor(private router:Router,
              private authService: AuthService,
              private readonly sidebarService: NbSidebarService) { }

  logout(){
    this.router.navigateByUrl('/auth');
    this.authService.logout();
  }

  toggleSidebar(): boolean {
    this.sidebarService.toggle();
    return false;
  }

  // uncompact(): boolean {
  //   this.sidebarService.compact();
  // }

  items: NbMenuItem[] = [
    {
      title: 'Inicio',
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
      icon: 'shopping-bag',
      link: '/dashboard/products'
    }
  ];
}
