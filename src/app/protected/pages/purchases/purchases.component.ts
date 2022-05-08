import { Component, OnInit, TemplateRef } from '@angular/core';
import { NbDialogService } from '@nebular/theme';
import Swal from 'sweetalert2';
import { ProductsPurchasesSales, PurchasesBody } from '../../interfaces/protected-interfaces';
import { ProductsService } from '../../services/products.service';
import { PurchasesService } from '../../services/purchases.service';

@Component({
  selector: 'app-purchases',
  templateUrl: './purchases.component.html',
  styleUrls: ['./purchases.component.scss']
})
export class PurchasesComponent implements OnInit {

  toastMixin: any
  modalEdit: boolean = false
  modalLoading: boolean = false
  searchText:string = ''
  total_amount:number = 0
  new_purchase:PurchasesBody = {}
  purchases:Array<PurchasesBody> = []
  new_purchase_product:ProductsPurchasesSales = {}
  purchase_products:Array<ProductsPurchasesSales> = []

  constructor(private dialogService: NbDialogService,
              private purchaseService: PurchasesService,
              private productService: ProductsService) { 
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

  ngOnInit(){
    this.getCompras()
  }

  openDialog(dialog: TemplateRef<any>, closeOnBackdropClick: boolean) {
    this.dialogService.open(dialog, { closeOnBackdropClick });
  }

  resetCompra(){
    this.new_purchase = {}
    this.purchase_products = []
  }

  getCompras(){
    this.purchaseService.getPurchases().subscribe(resp => {
      if (resp.ok === true){
        console.log(`getCompras - Response: ${resp}`);
        this.purchases = resp.compras
      }else{
      console.log('error', resp)
      Swal.fire('Error', resp, 'error')
      }
    })
  }

  addCompra(ref: any){
    console.log(`AddCompra - New sale: ${this.new_purchase}`);
    this.purchaseService.addPurchase(this.new_purchase)
    .subscribe(resp =>{
      if(resp.ok === true){
        console.log(`AddCompra - Response: ${resp}`)
        ref.close()
        this.toastMixin.fire({
          title: 'Compra completada'
        });
        this.resetCompra()
      }else{
        Swal.fire('Error', resp, 'error')
      }
    })
  }

  updateCompra(purchase:PurchasesBody, ref: any){
    let id = purchase._id || ''

    this.purchaseService.updatePurchase(id, purchase).subscribe(resp =>{
      if(resp.ok === true){
        ref.close()
        this.toastMixin.fire({
          title: 'Compra actualizada'
        });
        this.resetCompra()
      }else{
        Swal.fire('Error', resp.msg, 'error')
      }
    })
  }

  getCompra(id:string){
    this.modalEdit = true;
    this.purchaseService.getPurchase(id).subscribe(resp => {
      if (resp.ok === true){
        console.log(`getCompra - Response: ${resp}`);
        this.new_purchase = resp.compra
      }else{
      console.log('error', resp)
      Swal.fire('Error', resp, 'error')
      }
    })
  }

  deleteCompra(id:string){
    Swal.fire({
      title: '¿Estás seguro de eliminarla?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      cancelButtonText: 'Cancelar',
      confirmButtonText: 'Confirmar'
    }).then((result) => {
      if(result.isConfirmed){
        this.purchaseService.deletePurchase(id).subscribe(resp =>{
        if(resp.ok === true){
          this.toastMixin.fire({
            title: 'Compra eliminada'
          });
        }else{
          Swal.fire('Error', resp, 'error')
        }
      })
    }
  })
  }

}
