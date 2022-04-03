import Swal from 'sweetalert2';
import { ProveedoresService } from '../../services/proveedores.service';
import { ProveedoresBody, NewProveedoresBody } from '../../interfaces/protected-interfaces';
import { Component, OnInit, TemplateRef, ViewChild, Input, HostBinding } from '@angular/core';
import { NbDialogService } from '@nebular/theme';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { UploadsService } from '../../services/uploads.service';

@Component({
  selector: 'app-proveedores',
  templateUrl: './proveedores.component.html',
  styleUrls: ['./proveedores.component.scss']
})
export class ProveedoresComponent implements OnInit {

  proveedores: Array<ProveedoresBody> = []
  files: File[] = [];
  filteredOptions$!: Observable<string[]>;
  @ViewChild('autoInput') input:any;
  @ViewChild('provider') provider!: TemplateRef<any>;
  toastMixin: any
  providerID:string = ''
  cardMouseOver: Array<any> = []
  modalEdit = false
  providerValue = ''
  provider_edit = ''
  providerSrc = ''
  changeImg = true
  searchText = ''
  new_proveedor:NewProveedoresBody = {}
  edit_proveedor:ProveedoresBody = {}
  active_proveedor:ProveedoresBody = {}
  changesEdit = true

  correos:Array<string> = []
  telefonos:Array<string> = []
  direcciones:Array<string> = []
  editList = false
  list_edited = false

  viewLoading = false
  modalLoading = false;
  addLoading = false;
  updLoading = false;
  tele = false;

  uploadsUrl:string = environment.baseUrl + '/uploads/proveedores'

  constructor(private proveedoresService: ProveedoresService,
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
                this.edit_proveedor.correos = []
                this.edit_proveedor.telefonos = []
                this.edit_proveedor.direcciones = []
              }

  ngOnInit() {
    this.getProviders()
  }

  pri(old_idx:number){
    console.log(this.edit_proveedor.correos![old_idx]);
  }

  getProviders(){
    this.viewLoading = true
    this.proveedoresService.getProveedores().subscribe(res =>{
      console.log(res);
      const {proveedores} = res
      this.proveedores = proveedores
      this.viewLoading = false
    })
    }
  


  addProvider(ref: any){
    console.log(this.new_proveedor);
    this.proveedoresService.addProveedor(this.new_proveedor)
    .subscribe(resp =>{
      if(resp.ok === true){
        console.log(resp)
        this.cargarProviderImg(resp.proveedor._id)
        this.getProviders()
        ref.close()
        this.toastMixin.fire({
          title: 'Proveedor agregado'
        });
      }else{
        Swal.fire('Error', resp, 'error')
      }
    })
  }

  cargarProviderImg(id:string) {
    if(this.files.length > 0){
    this.uploadsService.cargarImg(this.files, 'proveedores', id).subscribe(resp =>{
      if(resp.ok === true){
        console.log(resp.modelo.img)
      }else{
        Swal.fire('Error', resp, 'error')
      }
    })
  }
  }

  updateProvider(provider:ProveedoresBody, ref: any){
    let id = provider._id ? provider._id : ''

    this.proveedoresService.updateProveedor(id, provider).subscribe(resp =>{
      if(resp.ok === true){
        let nombre_empresa = resp.proveedor.nombre_empresa
        let _id = resp.proveedor._id
        let index = 0
        this.proveedores.forEach(function(prov, i){
          if(prov._id === id){
            index = i
          }
        })
        this.proveedores = this.proveedores.filter(item => item._id !== id)
        this.proveedores.splice(index, 0, {_id, nombre_empresa});
        ref.close()
        this.getProviders()
        this.toastMixin.fire({
          title: 'Proveedor actualizado'
        });
      }else{
        Swal.fire('Error', resp.msg, 'error')
      }
    })
  }

  getProvider(id:string){
    this.modalEdit = true;
    this.proveedoresService.getProveedor(id).subscribe(resp => {
      if (resp.ok === true){
        this.active_proveedor = resp.proveedor
        // this.providerValue = resp.proveedor.nombre_empresa
        // this.providerID = resp.proveedor._id
        this.providerSrc = this.uploadsUrl + '/' + resp.proveedor._id
      }else{
      console.log('error', resp)
      Swal.fire('Error', resp, 'error')
      }
    })
  }

  deleteProvider(id:string){
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
        this.proveedoresService.deleteProveedor(id).subscribe(resp =>{
        if(resp.ok === true){
          this.proveedores = this.proveedores.filter(item => item._id !== id)
          this.getProviders()
          this.toastMixin.fire({
            title: 'Proveedor eliminado'
          });
        }else{
          Swal.fire('Error', resp, 'error')
        }
      })
    }
  })
  }

  isFlipped: boolean= false;
  selectedItem:any;
  info_selected = ''

  flip_card(index:number) {
    this.selectedItem = index
    this.isFlipped = !this.isFlipped;
  }

  content_back_card(elementSelected: string){
    this.info_selected = elementSelected
  }
  
  addListElement(list: string,value: string|undefined){
    switch (list) {
      case 'telefono':
        this.new_proveedor.telefono = ''
        if (value?.trim() !== '' && value !== undefined)
          this.active_proveedor.telefonos?.push(value)
        break;
      case 'correo':
        let regex = '[a-zA-Z0-9_]+([.][a-zA-Z0-9_]+)*@[a-zA-Z0-9_]+([.][a-zA-Z0-9_]+)*[.][a-zA-Z]{2,5}'
        this.new_proveedor.correo = ''
        if (value?.trim() !== '' && value !== undefined){
          let valid = this.validaCampos(regex, value)
          if (valid)
            this.active_proveedor.correos?.push(value)
          else
            Swal.fire('Error', 'Correo no válido', 'error')
        }
        break;
      case 'direccion':
        this.new_proveedor.direccion = ''
        if (value?.trim() !== '' && value !== undefined)
          this.active_proveedor.direcciones?.push(value)
        break;
      default:
        break;
      }
  }

  
  editListElement(list:string, idx_old_value:number, new_value:string|undefined){
    
    switch (list) {
      case 'telefono':
        this.active_proveedor.telefonos![idx_old_value] = new_value
        break;
      case 'correo':
        this.active_proveedor.correos![idx_old_value] = new_value
        break;
      case 'direccion':
        this.active_proveedor.direcciones![idx_old_value] = new_value
        break;
      default:
        break;
      }
    this.editList = false
  }

  cancelEdit(){
    this.list_edited = false;
    this.editList = false
    this.edit_proveedor.correos = []
    this.edit_proveedor.telefonos = []
    this.edit_proveedor.direcciones = []
  }

  delListElement(list:string, idx_value:number){
    switch (list) {
      case 'telefono':
        this.new_proveedor.telefono = ''
        //?Splice retorna el eliminado por eso no lo guardo en una constante, solo quiero que lo elimine
        this.active_proveedor.telefonos?.splice(idx_value,1)
        break;
      case 'correo':
        this.new_proveedor.correo = ''
        this.active_proveedor.correos?.splice(idx_value,1)
        console.log(this.active_proveedor.correos);
        break;
      case 'direccion':
        this.new_proveedor.direccion = ''
        this.active_proveedor.direcciones?.splice(idx_value,1)
        break;
      default:
        break;
      }
  }


  openDialog(dialog: TemplateRef<any>, closeOnBackdropClick: boolean) {
    // this.checkedEstado = true
    this.onRemoveDrag(this.files[0]);
    this.dialogService.open(dialog, { closeOnBackdropClick });
    // this.dialogRef = this.dialogService.open(dialog, { closeOnBackdropClick });
  }

  resetProvider(){
    this.new_proveedor = {}
  }

  cancelDialog(){
    this.resetProvider()
    this.editList = false
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

  isDisplay(provider: string): boolean{
    return this.cardMouseOver.includes(provider) ? true : false
  }

  

  validaCampos(expresion:string, campo:string){
      let exp = new RegExp(expresion)
      if(!exp.test(campo)){
          return false;
      }else{
          return true
      }
    }

}
