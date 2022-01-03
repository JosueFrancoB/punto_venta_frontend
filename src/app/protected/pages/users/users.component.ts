import { Component, OnInit } from '@angular/core';
import { UserData } from '../../interfaces/protected-interfaces';
import { UsersService } from '../../services/users.service';

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styles: []
})
export class UsersComponent implements OnInit {
  
  usuarios: Array<Object> = []

  constructor(private usersService:UsersService) { }
  
  ngOnInit() {
    this.usersService.getUsers().subscribe(res =>{
      const {usuarios} = res
      console.log(usuarios);
      this.usuarios = usuarios
    })
  }

  settings = {
    add: {
      addButtonContent: '<i class="nb-add"></i>',
      createButtonContent: '<i class="nb-checkmark"></i>',
      cancelButtonContent: '<i class="nb-close"></i>',
    },
    edit: {
      editButtonContent: '<i class="nb-edit"></i>',
      saveButtonContent: '<i class="nb-checkmark"></i>',
      cancelButtonContent: '<i class="nb-close"></i>',
    },
    delete: {
      deleteButtonContent: '<i class="nb-trash"></i>',
      confirmDelete: true,
    },
    columns: {
      uid: {
        title: 'ID',
        type: 'number',
      },
      nombre: {
        title: 'Nombre',
        type: 'string',
      },
      correo: {
        title: 'Correo',
        type: 'string',
      },
      estado:{
        title: 'Estado',
        type: 'boolean'
      },
      rol: {
        title: 'Rol de usuario',
        type: 'string'
      },
      google: {
        title: 'Age',
        type: 'boolean',
      }
    },
  };

  


  onDeleteConfirm(event:any): void {
    if (window.confirm('Are you sure you want to delete?')) {
      event.confirm.resolve();
    } else {
      event.confirm.reject();
    }
  }


}
