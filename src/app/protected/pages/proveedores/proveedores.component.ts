import Swal from 'sweetalert2';
import { ProveedoresService } from '../../services/proveedores.service';
import { ProveedoresBody } from '../../interfaces/protected-interfaces';
import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
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
  new_proveedor:ProveedoresBody = {}
  changesEdit = true

  viewLoading = false
  modalLoading = false;
  addLoading = false;
  updLoading = false;

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
              }

  ngOnInit() {
    this.getProviders()
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
        if (this.changeImg === true){
        this.cargarProviderImg(id)
        }
        let nombre_empresa = resp.proveedor.nombre_empresa
        let _id = resp.proveedor._id
        let img = resp.proveedor.img
        let index = 0
        this.proveedores.forEach(function(prov, i){
          if(prov._id === id){
            index = i
          }
        })
        this.proveedores = this.proveedores.filter(item => item._id !== id)
        this.proveedores.splice(index, 0, {_id, nombre_empresa,img});
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
        this.new_proveedor = resp.proveedor
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

}
