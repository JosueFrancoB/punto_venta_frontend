import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { NbWindowService } from '@nebular/theme';
import { UsersService } from '../../services/users.service';
import { NbDialogService } from '@nebular/theme';
import { RegisterComponent } from '../../../auth/pages/register/register.component';
import Swal from 'sweetalert2'
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from 'src/app/auth/services/auth.service';
import { LocalDataSource } from 'ng2-smart-table';
import { Usuario } from 'src/app/auth/interfaces/interfaces';
import { UserBody } from '../../interfaces/protected-interfaces';


@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.scss']
})
export class UsersComponent implements OnInit {
  
  usuarios: any
  user_id: string = ''
  user_rol: string = 'Usuario'
  user: UserBody = {
    nombre: '',
    password: '',
    correo: '',
    estado: true,
    rol: ''
  }

  checkedEstado = true;
  selectedRol = 'Usuario';
  changesEdit = false;

  modalEdit:boolean = false;
  source: LocalDataSource;
  @ViewChild('Usuario') Usuario!: TemplateRef<any>;

  constructor(private usersService:UsersService,
              private dialogService: NbDialogService,
              private fb: FormBuilder) {
                this.source = new LocalDataSource(this.usuarios);
              }

  users_roles:Array<string> = ['Usuario', 'Administrador']
  
  ngOnInit() {
    this.getUsers()
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

  getUsers(){
    this.usersService.getUsers().subscribe(res =>{
      const {usuarios} = res
      console.log(usuarios);
      usuarios.forEach((user:any) => {
        user.estado = user.estado ? 'Activo' :  'Inactivo';
      });
      this.source.load(usuarios)
    })
  }

  getRol(event:any): void{
    console.log(event);
    this.changesEdit = true
    this.user_rol = event
  }

  addUser(){
      if (this.addUserForm.invalid){
        this.addUserForm.markAllAsTouched()
        return
      }
      console.log(this.addUserForm.value)
      const {nombre, correo, password} = this.addUserForm.value
      const rol = this.user_rol
      //TODO: Arreglar esto para que añada antes estaba el de registro pero me cambie el token en el backend y verificar lo de resp === true porque en este regreso otra cosa
      this.usersService.addUser(nombre, correo, password, rol)
        .subscribe(resp =>{
          if (resp === true){
            this.getUsers()
            
          }else{
            //TODO: Mostrar mensaje de error
            //+Correo repetido
            Swal.fire('Error', resp, 'error')
          }
        })
  }

  updateUser(id: string){
    this.usersService.updateUser(id, this.user).subscribe(resp => {
      if(resp === true){
        console.log(resp);
      }else{
        Swal.fire('Error', resp, 'error')
      }
    },
      err => {
        console.log(err);
    })
  }

  get addUserFormControls(): any {
    return this.addUserForm['controls'];
  }

  campoNoValido(campo:string){
    return this.addUserFormControls[campo].errors && this.addUserFormControls[campo].touched
  }

  onUserRowSelect(event:any): void {
      this.modalEdit = true;
      this.changesEdit = false;
      let {rol} = event.data
      console.log(`El nuevo rol ${rol}`);
      delete event.data.password
      this.user_rol = rol
      this.selectedRol = rol
      this.user_id = event.data.uid
      // console.log(this.user);
      // console.log(event.data);
      this.usersService.getUser(this.user_id).subscribe(resp => {
        console.log(resp);
        
        this.user = resp
      },err => console.log(err))
      
    }

    nameChange(event: any){
      console.log(event);
      this.changesEdit = true
    }
    emailChange(event: any){
      console.log(event);
      this.changesEdit = true
    }

    statusChange(event: any){
      console.log(event);
      this.changesEdit = true
    }
    

    userReset(){
    this.user.nombre = ''
    this.user.password = ''
    this.user.correo = ''
    this.user.rol = ''
    this.selectedRol = 'Usuario';
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
      img: {
        filter: false,
        title: 'Foto',
        type: 'html',
        valuePrepareFunction: (img:string) => { return `<img width="50px" src="${img}" />`; },
        },
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
      }
    },
    
  };

  
  openDialog(dialog: TemplateRef<any>, closeOnBackdropClick: boolean) {
    this.dialogService.open(dialog, { closeOnBackdropClick });
  }

  cancelDialog(){
    this.addUserForm.reset()
  }
  
  

  onSearch(query: string = '') {
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

  capturarFile(event: any){
    const archivo = event.target.files[0]
    console.log(event.target.files);
  }

  


}
