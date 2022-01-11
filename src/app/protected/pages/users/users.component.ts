import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { UsersService } from '../../services/users.service';
import { NbDialogService } from '@nebular/theme';
import Swal from 'sweetalert2'
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { LocalDataSource } from 'ng2-smart-table';
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
  
  toastMixin: any
  checkedEstado: boolean | undefined = true;
  selectedRol = 'Usuario';
  changesEdit = false;
  actionSuccess = true;
  viewLoading = false;
  modalLoading = false;
  delLoading = false;
  addLoading = false;
  updLoading = false;
  modalEdit:boolean = false;
  source: LocalDataSource;
  @ViewChild('Usuario') Usuario!: TemplateRef<any>;

  constructor(private usersService:UsersService,
              private dialogService: NbDialogService,
              private fb: FormBuilder) {
                this.source = new LocalDataSource(this.usuarios);
                this.toastMixin = Swal.mixin({
                  toast: true,
                  icon: 'success',
                  title: '',
                  position: 'top-right',
                  showConfirmButton: false,
                  timer: 3000,
                  timerProgressBar: true,
                  didOpen: (toast) => {
                    toast.addEventListener('mouseenter', Swal.stopTimer)
                    toast.addEventListener('mouseleave', Swal.resumeTimer);
                  }
                })
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
    this.viewLoading = true
    this.usersService.getUsers().subscribe(res =>{
      const {usuarios} = res
      usuarios.forEach((user:any) => {
        user.estado = user.estado ? 'Activo' :  'Inactivo';
      });
      this.source.load(usuarios)
      this.viewLoading = false
    })
  }

  getRol(event:any): void{
    console.log(event);
    this.changesEdit = true
    this.user_rol = event
  }

  addUser(ref: any){
      if (this.addUserForm.invalid){
        this.addUserForm.markAllAsTouched()
        return
      }
      const {nombre, correo, password} = this.addUserForm.value
      const user = {nombre, correo, password, rol: this.user_rol}
      this.usersService.addUser(user)
        .subscribe(resp =>{
          if (resp.ok === true){
            this.getUsers()
            ref.close()
            this.toastMixin.fire({
              title: 'Usuario agregado'
            });
          }else{
            Swal.fire('Error', resp, 'error')
          }
          this.addLoading = false
        })
  }

  updateUser(id: string, ref: any){
    this.user.estado = this.checkedEstado
    this.updLoading = true
    this.usersService.updateUser(id, this.user).subscribe(resp => {
      if(resp.ok === true){
        console.log(resp);
        this.toastMixin.fire({
          title: 'Usuario actualizado'
        });
        this.getUsers()
        ref.close()
      }else{
        Swal.fire('Error', resp, 'error')
      }
      this.updLoading = false
    })
  }

  deleteUser(id: string, ref: any){
    Swal.fire({
      title: '¿Estás seguro de eliminarlo?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Confirmar'
    }).then((result) => {
      this.delLoading = true
      if (result.isConfirmed) {
        this.usersService.deleteUser(id).subscribe(resp => {
            if (resp.ok === true){
              this.getUsers()
              ref.close()
              this.toastMixin.fire({
                title: 'Usuario eliminado'
              });
            }else{
              Swal.fire('Error', resp, 'error')
              console.log(resp)
            }
            this.delLoading = false
          },
        )
        
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
      this.modalEdit = true;
      this.changesEdit = false;
      let {rol} = event.data
      delete event.data.password
      this.user_rol = rol
      this.selectedRol = rol
      this.user_id = event.data.uid
      this.modalLoading = true
      this.usersService.getUser(this.user_id).subscribe(resp => {
        if (resp.ok === true){
          this.user = resp.usuario
          this.checkedEstado = this.user.estado
        }
        this.modalLoading = false
      })
      
    }

    nameChange(event: any){
      this.changesEdit = true
    }
    emailChange(event: any){
      this.changesEdit = true
    }

    statusChange(event: any){
      this.checkedEstado = event
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
    // rowClassFunction: ((row:any) =>{
    //   if(row.data.estado == 'Activo'){
    //     return 'solved';
    //   }else {
    //     return 'aborted'
    //   }
    // }),
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
    this.checkedEstado = true
    this.dialogService.open(dialog, { closeOnBackdropClick });
    // this.dialogRef = this.dialogService.open(dialog, { closeOnBackdropClick });
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
