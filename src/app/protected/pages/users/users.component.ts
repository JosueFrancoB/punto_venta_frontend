import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { NbWindowService } from '@nebular/theme';
import { UsersService } from '../../services/users.service';
import { NbDialogService } from '@nebular/theme';
import { RegisterComponent } from '../../../auth/pages/register/register.component';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from 'src/app/auth/services/auth.service';
import { LocalDataSource } from 'ng2-smart-table';


@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.scss']
})
export class UsersComponent implements OnInit {
  
  usuarios: any
  source: LocalDataSource;
  @ViewChild('Usuario') Usuario!: TemplateRef<any>;

  constructor(private usersService:UsersService,
              private windowService: NbWindowService,
              private dialogService: NbDialogService,
              private fb: FormBuilder,
              private authService: AuthService) {
                this.source = new LocalDataSource(this.usuarios);
              }

  users_roles:Array<string> = ['Usuario', 'Administrador']
  
  ngOnInit() {
    this.usersService.getUsers().subscribe(res =>{
      const {usuarios} = res
      console.log(usuarios);
      this.source.load(usuarios)
    })
  }

  correoPattern: string = "^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$"

  addUserForm: FormGroup = this.fb.group({
    nombre: ['', [Validators.required] ],
    correo: ['', [Validators.required, Validators.pattern(this.correoPattern)] ],
    password: ['', [Validators.required, Validators.minLength(6)] ]
  })


  get EmailErrorMsg(): string{
    const errors = this.addUserForm.get('correo')?.errors
    if (errors?.['required']){
      return 'El correo es obligatorio';
    }else if(errors?.['pattern']){
      return 'El correo no es válido';
    }
    return '';
  }

  get PasswordErrorMsg(): string{
    const errors = this.addUserForm.get('password')?.errors
    if (errors?.['required']){
      return 'La contraseña es obligatoria!';
    }else if(errors?.['minlength']){
      return 'La contraseña debe de tener 6 o más caracteres';
    }
    return '';
  }

  addUser(){
      if (this.addUserForm.invalid){
        this.addUserForm.markAllAsTouched()
        return
      }
      console.log(this.addUserForm.value)
      const {nombre, correo, password} = this.addUserForm.value
      this.authService.registro(nombre, correo, password)
        .subscribe(resp =>{
          if (resp === true){
            // this.router.navigateByUrl('/dashboard')
          }else{
            //TODO: Mostrar mensaje de error
            //+Correo repetido
          }
        })
  }

  get addUserFormControls(): any {
    return this.addUserForm['controls'];
  }

  campoNoValido(campo:string){
    return this.addUserFormControls[campo].errors && this.addUserFormControls[campo].touched
  }

  onUserRowSelect(event:any): void {
      console.log(event.data);
  }

  settings = {
    actions: {
      add: false,
      edit: false,
      delete: false,
      // custom: [{ name: 'ourCustomAction', title: '<i class="nb-compose"></i>' }],
      // position: 'right'
    },
    columns: {
      uid: {
        title: 'ID',
        type: 'number',
        filter: false,
      },
      nombre: {
        title: 'Nombre',
        type: 'string',
        filter: false,
      },
      correo: {
        title: 'Correo',
        type: 'string',
        filter: false,
      },
      estado:{
        title: 'Estado',
        type: 'boolean',
        filter: false,
      },
      rol: {
        title: 'Rol de usuario',
        type: 'string',
        filter: false,
      },
      google: {
        title: 'Age',
        type: 'boolean',
        filter: false,
      }
    },
  };

  
  openDialog(dialog: TemplateRef<any>) {
    this.dialogService.open(dialog, { context: 'this is some additional data passed to dialog' });
  }

  cancelDialog(){
    this.addUserForm.reset()
  }

  getRol(event:any): void{
    console.log(event.value);
    // if (event){
    // }
  }

  onSearch(query: string = '') {
    console.log(this.source);
    console.log(query.length);
    if(query == ''){
      this.source.setFilter([]);
    }else{
    this.source.setFilter([
      // fields we want to include in the search
      {
        field: 'uid',
        search: query
      },
      {
        field: 'nombre',
        search: query
      },
      {
        field: 'correo',
        search: query
      },
      {
        field: 'estado',
        search: query
      },
      {
        field: 'rol',
        search: query
      }
    ], false); 
  }
  }
  // onDeleteConfirm(event:any): void {
  //   if (window.confirm('Are you sure you want to delete?')) {
  //     event.confirm.resolve();
  //   } else {
  //     event.confirm.reject();
  //   }
  // }


}
