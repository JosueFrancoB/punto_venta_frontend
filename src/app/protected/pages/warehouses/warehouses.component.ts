import Swal from 'sweetalert2';
import { Observable } from 'rxjs';
import { NbDialogService } from '@nebular/theme';
import { WarehouseService } from '../../services/warehouse.service';
import { WarehouseBody } from '../../interfaces/protected-interfaces';
import { environment } from 'src/environments/environment';
import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';

@Component({
  selector: 'app-warehouses',
  templateUrl: './warehouses.component.html',
  styleUrls: ['./warehouses.component.scss']
})
export class WarehousesComponent implements OnInit {

  almacenes: Array<WarehouseBody> = []
  filteredOptions$!: Observable<string[]>;
  @ViewChild('autoInput') input:any;
  @ViewChild('warehouse') warehouse!: TemplateRef<any>;
  toastMixin: any
  cardMouseOver: Array<any> = []
  modalEdit = false
  warehouseValue = ''
  warehouse_edit = ''
  searchText = ''
  new_warehouse:WarehouseBody = {}
  changesEdit = true

  viewLoading = false
  modalLoading = false;
  addLoading = false;
  updLoading = false;
  no_data = false

  uploadsUrl:string = environment.baseUrl + '/uploads/warehouses'

  pageOfItems!:Array<any>

  constructor(private warehouseService: WarehouseService,
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
    this.getWarehouses()
  }

  getWarehouses(){
    this.viewLoading = true
    this.warehouseService.getAlmacenes().subscribe(res =>{
      console.log(res);
      const {almacenes} = res
      this.almacenes = almacenes
      if(this.almacenes.length<=0){
        this.no_data = true
      }else{
        this.no_data = false
      }
      this.viewLoading = false
    })
    }

  addWarehouse(ref: any){
    console.log(this.new_warehouse);
    this.warehouseService.addAlmacen(this.new_warehouse)
    .subscribe(resp =>{
      if(resp.ok === true){
        console.log(resp)
        this.getWarehouses()
        ref.close()
        this.toastMixin.fire({
          title: 'Almacen agregado'
        });
        this.resetWarehouse()
      }else{
        Swal.fire('Error', resp, 'error')
      }
    })
  }


  updateWarehouse(warehouse:WarehouseBody, ref: any){
    let id = warehouse._id ? warehouse._id : ''

    this.warehouseService.updateAlmacen(id, warehouse).subscribe(resp =>{
      if(resp.ok === true){
        let nombre = resp.almacen.nombre
        let _id = resp.almacen._id
        let index = 0
        this.almacenes.forEach(function(cli, i){
          if(cli._id === id){
            index = i
          }
        })
        this.almacenes = this.almacenes.filter(item => item._id !== id)
        this.almacenes.splice(index, 0, {_id, nombre});
        ref.close()
        this.getWarehouses()
        this.toastMixin.fire({
          title: 'Almacen actualizado'
        });
        this.resetWarehouse()
      }else{
        Swal.fire('Error', resp.msg, 'error')
      }
    })
  }

  getWarehouse(id:string){
    this.modalEdit = true;
    this.warehouseService.getAlmacen(id).subscribe(resp => {
      if (resp.ok === true){
        this.new_warehouse = resp.almacen
      }else{
      console.log('error', resp)
      Swal.fire('Error', resp, 'error')
      }
    })
  }

  deleteWarehouse(id:string){
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
        this.warehouseService.deleteAlmacen(id).subscribe(resp =>{
        if(resp.ok === true){
          this.almacenes = this.almacenes.filter(item => item._id !== id)
          this.getWarehouses()
          this.toastMixin.fire({
            title: 'Almacen eliminado'
          });
        }else{
          Swal.fire('Error', resp, 'error')
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
    this.dialogService.open(dialog, { closeOnBackdropClick });
  }

  resetWarehouse(){
    this.new_warehouse = {}
  }

  cancelDialog(){
    this.resetWarehouse()
  }

  mouseEnter(data: any) {
    this.cardMouseOver.push(data.target.title)
  }

  mouseLeave(data: any) {
    let value = (data.target.title)
    this.cardMouseOver = this.cardMouseOver.filter(item => item !== value)
  }

  isDisplay(warehouse: string): boolean{
    return this.cardMouseOver.includes(warehouse) ? true : false
  }
}
