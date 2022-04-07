import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { NbDialogService } from '@nebular/theme';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import Swal from 'sweetalert2';
import { ClientesBody } from '../../interfaces/protected-interfaces';
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
  new_cliente:ClientesBody = {}
  changesEdit = true

  viewLoading = false
  modalLoading = false;
  addLoading = false;
  updLoading = false;

  uploadsUrl:string = environment.baseUrl + '/uploads/proveedores'

  options = [
    { value: 'telefonos', label: 'Telefonos' },
    { value: 'correos', label: 'Correos' },
    { value: 'direcciones', label: 'Direcciones' },
  ];
  option:any;

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
        Swal.fire('Error', resp, 'error')
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
        if (this.changeImg === true){
        this.cargarClientImg(id)
        }
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
        Swal.fire('Error', resp.msg, 'error')
      }
    })
  }

  getClient(id:string){
    this.modalEdit = true;
    this.clientesService.getCliente(id).subscribe(resp => {
      if (resp.ok === true){
        this.new_cliente = resp.cliente
        // this.providerValue = resp.proveedor.nombre_empresa
        // this.providerID = resp.proveedor._id
        this.clientSrc = this.uploadsUrl + '/' + resp.cliente._id
      }else{
      console.log('error', resp)
      Swal.fire('Error', resp, 'error')
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
          Swal.fire('Error', resp, 'error')
        }
      })
    }
  })
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

}
