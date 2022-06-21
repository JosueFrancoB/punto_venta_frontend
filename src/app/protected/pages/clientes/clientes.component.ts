import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { NbDialogService } from '@nebular/theme';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import Swal from 'sweetalert2';
import { ClientesBody, NewClientesBody } from '../../interfaces/protected-interfaces';
import { ClientesService } from '../../services/clientes.service';
import { UploadsService } from '../../services/uploads.service';

@Component({
  selector: 'app-clientes',
  templateUrl: './clientes.component.html',
  styleUrls: ['./clientes.component.scss']
})
export class ClientesComponent implements OnInit {

  clientes: Array<ClientesBody> = []
  files: File[] = [];
  filteredOptions$!: Observable<string[]>;
  @ViewChild('autoInput') input:any;
  @ViewChild('client') client!: TemplateRef<any>;
  toastMixin: any
  clientID:string = ''
  cardMouseOver: Array<any> = []
  modalEdit = false
  clientValue = ''
  client_edit = ''
  clientSrc = ''
  changeImg = true
  searchText = ''
  new_cliente:NewClientesBody = {}
  edit_cliente:ClientesBody = {}
  active_cliente:ClientesBody = {}
  changesEdit = true

  itemsPerPage:number = 10
  paginaActual!:number;
  correos:Array<string> = []
  telefonos:Array<string> = []
  direcciones:Array<string> = []
  editList = false
  list_edited = false

  viewLoading = false
  modalLoading = false;
  addLoading = false;
  updLoading = false;

  uploadsUrl:string = environment.baseUrl + '/uploads/clientes'

  items:Array<ClientesBody> = [];
  pageOfItems!: Array<any>;

  constructor(private clientesService: ClientesService,
              private uploadsService: UploadsService,
              private dialogService: NbDialogService) { 
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
                this.edit_cliente.correos = []
                this.edit_cliente.telefonos = []
                this.edit_cliente.direcciones = []
              }

  ngOnInit() {
    this.getClients()
  }

  getClients(){
    this.viewLoading = true
    this.clientesService.getClientes().subscribe(res =>{
      console.log(res);
      const {clientes} = res
      this.clientes = clientes
      this.viewLoading = false
    })
    }

  addClient(ref: any){
    console.log(this.new_cliente);
    this.clientesService.addCliente(this.new_cliente)
    .subscribe(resp =>{
      if(resp.ok === true){
        console.log(resp)
        this.cargarClientImg(resp.cliente._id)
        this.getClients()
        ref.close()
        this.toastMixin.fire({
          title: 'Cliente agregado'
        });
      }else{
        let msg = resp.msg || resp
        Swal.fire('Error', msg, 'error')
      }
    })
  }

  cargarClientImg(id:string) {
    if(this.files.length > 0){
    this.uploadsService.cargarImg(this.files, 'clientes', id).subscribe(resp =>{
      if(resp.ok === true){
        console.log(resp.modelo.img)
      }else{
        Swal.fire('Error', resp, 'error')
      }
    })
  }
  }

  updateClient(client:ClientesBody, ref: any){
    let id = client._id ? client._id : ''

    this.clientesService.updateCliente(id, client).subscribe(resp =>{
      if(resp.ok === true){
        let nombre = resp.cliente.nombre
        let _id = resp.cliente._id
        let img = resp.cliente.img
        let index = 0
        this.clientes.forEach(function(cli, i){
          if(cli._id === id){
            index = i
          }
        })
        this.clientes = this.clientes.filter(item => item._id !== id)
        this.clientes.splice(index, 0, {_id, nombre, img});
        ref.close()
        this.getClients()
        this.toastMixin.fire({
          title: 'Cliente actualizado'
        });
      }else{
        let msg = resp.msg || resp
        Swal.fire('Error', msg, 'error')
      }
    })
  }

  getClient(id:string){
    this.modalEdit = true;
    this.clientesService.getCliente(id).subscribe(resp => {
      if (resp.ok === true){
        this.active_cliente = resp.cliente
        // this.providerValue = resp.proveedor.nombre_empresa
        // this.providerID = resp.proveedor._id
        this.clientSrc = this.uploadsUrl + '/' + resp.cliente._id
      }else{
        let msg = resp.msg || resp
        Swal.fire('Error', msg, 'error')
      }
    })
  }

  deleteClient(id:string){
    Swal.fire({
      title: '¿Estás seguro de eliminarlo?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      cancelButtonText: 'Cancelar',
      confirmButtonText: 'Confirmar'
    }).then((result) => {
      if(result.isConfirmed){
        this.clientesService.deleteCliente(id).subscribe(resp =>{
        if(resp.ok === true){
          this.clientes = this.clientes.filter(item => item._id !== id)
          this.getClients()
          this.toastMixin.fire({
            title: 'Cliente eliminado'
          });
        }else{
          let msg = resp.msg || resp
          Swal.fire('Error', msg, 'error')
        }
      })
    }
  })
  }

  onChangePage(pageOfItems: Array<any>) {
    // update current page of items
    this.pageOfItems = pageOfItems;
  }

  openDialog(dialog: TemplateRef<any>, closeOnBackdropClick: boolean) {
    // this.checkedEstado = true
    this.onRemoveDrag(this.files[0]);
    this.dialogService.open(dialog, { closeOnBackdropClick });
    // this.dialogRef = this.dialogService.open(dialog, { closeOnBackdropClick });
  }

  resetClient(){
    this.new_cliente = {}
  }

  cancelDialog(){
    this.resetClient()
  }
  onSelectDrag(event:any) {
    if(this.files && this.files.length >=1) {
      this.onRemoveDrag(this.files[0]);
    }
    this.files.push(...event.addedFiles);
    console.log(...event.addedFiles);
  }
   
  onRemoveDrag(event:any) {
    this.files.splice(this.files.indexOf(event), 1);
  }

  mouseEnter(data: any) {
    this.cardMouseOver.push(data.target.title)
  }

  mouseLeave(data: any) {
    let value = (data.target.title)
    this.cardMouseOver = this.cardMouseOver.filter(item => item !== value)
  }

  isDisplay(client: string): boolean{
    return this.cardMouseOver.includes(client) ? true : false
  }

  isRevealed:boolean = false;
  selectedItem:any;
  info_selected = ''

  reveal_card(index:number) {
    this.selectedItem = index
    this.isRevealed = !this.isRevealed;
  }

  content_back_card(elementSelected: string){
    this.info_selected = elementSelected
    console.log(this.info_selected);
  }


  addListElement(list: string,value: string|undefined){
    let regex = ''
    switch (list) {
      case 'telefono':
        regex = '^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$'
        this.new_cliente.telefono = ''
        if (value?.trim() !== '' && value !== undefined){
          let valid = this.validaCampos(regex, value)
          if (valid)
            this.active_cliente.telefonos?.push(value)
          else
            Swal.fire('Error', 'Teléfono no válido', 'error')
        }
        break;
      case 'correo':
        regex = '[a-zA-Z0-9_]+([.][a-zA-Z0-9_]+)*@[a-zA-Z0-9_]+([.][a-zA-Z0-9_]+)*[.][a-zA-Z]{2,5}'
        this.new_cliente.correo = ''
        if (value?.trim() !== '' && value !== undefined){
          let valid = this.validaCampos(regex, value)
          if (valid)
            this.active_cliente.correos?.push(value)
          else
            Swal.fire('Error', 'Correo no válido', 'error')
        }
        break;
      case 'direccion':
        this.new_cliente.direccion = ''
        if (value?.trim() !== '' && value !== undefined)
          this.active_cliente.direcciones?.push(value)
        break;
      default:
        break;
      }
  }

  
  editListElement(list:string, idx_old_value:number, new_value:string|undefined){
    let regex = ''
    switch (list) {
      case 'telefono':
        regex = '^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$'
        if (new_value?.trim() !== '' && new_value !== undefined){
          let valid = this.validaCampos(regex, new_value)
          if (valid)
            this.active_cliente.telefonos![idx_old_value] = new_value
          else
            Swal.fire('Error', 'Teléfono no válido', 'error')
        }
        break;
      case 'correo':
        regex = '[a-zA-Z0-9_]+([.][a-zA-Z0-9_]+)*@[a-zA-Z0-9_]+([.][a-zA-Z0-9_]+)*[.][a-zA-Z]{2,5}'
        if (new_value?.trim() !== '' && new_value !== undefined){
          let valid = this.validaCampos(regex, new_value)
          if (valid)
            this.active_cliente.correos![idx_old_value] = new_value
          else
            Swal.fire('Error', 'Correo no válido', 'error')
        }
        break;
      case 'direccion':
        if (new_value?.trim() !== '' && new_value !== undefined)
          this.active_cliente.direcciones![idx_old_value] = new_value
        else
          Swal.fire('Error', 'Direccion inválida', 'error')
        break;
      default:
        break;
      }
    this.editList = false
  }

  cancelEdit(){
    this.list_edited = false;
    this.editList = false
    this.edit_cliente.correos = []
    this.edit_cliente.telefonos = []
    this.edit_cliente.direcciones = []
  }

  delListElement(list:string, idx_value:number){
    switch (list) {
      case 'telefono':
        this.new_cliente.telefono = ''
        //?Splice retorna el eliminado por eso no lo guardo en una constante, solo quiero que lo elimine
        this.active_cliente.telefonos?.splice(idx_value,1)
        break;
      case 'correo':
        this.new_cliente.correo = ''
        this.active_cliente.correos?.splice(idx_value,1)
        console.log(this.active_cliente.correos);
        break;
      case 'direccion':
        this.new_cliente.direccion = ''
        this.active_cliente.direcciones?.splice(idx_value,1)
        break;
      default:
        break;
      }
  }

  validaCampos(expresion:string, campo:string|undefined){
    let exp = new RegExp(expresion)
    if(typeof campo == 'string' && !exp.test(campo)){
        return false;
    }else{
        return true
    }
  }

}
