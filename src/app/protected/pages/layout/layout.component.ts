import { Component } from '@angular/core';
import { NbMenuItem, NbSidebarService } from '@nebular/theme';

@Component({
  selector: 'app-layout',
  templateUrl: './layout.component.html',
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
export class LayoutComponent {

  toggleSidebar(): boolean {
    this.sidebarService.toggle();
    return false;
  }
  constructor(private readonly sidebarService: NbSidebarService) { }

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
