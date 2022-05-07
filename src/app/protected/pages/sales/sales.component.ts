import { Component, OnInit, TemplateRef } from '@angular/core';
import { NbDialogService } from '@nebular/theme';
import Swal from 'sweetalert2';
import { ProductsPurchasesSales, SalesBody } from '../../interfaces/protected-interfaces';
import { ProductsService } from '../../services/products.service';
import { SalesService } from '../../services/sales.service';

@Component({
  selector: 'app-sales',
  templateUrl: './sales.component.html',
  styleUrls: ['./sales.component.scss']
})
export class SalesComponent implements OnInit {

  toastMixin: any
  modalEdit: boolean = false
  modalLoading: boolean = false
  searchText:string = ''
  total_amount:number = 0
  new_sale:SalesBody = {}
  new_sale_product:ProductsPurchasesSales = {}
  sale_products:Array<ProductsPurchasesSales> = []

  constructor(private dialogService: NbDialogService,
              private saleService: SalesService,
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
  }

  openDialog(dialog: TemplateRef<any>, closeOnBackdropClick: boolean) {
    this.dialogService.open(dialog, { closeOnBackdropClick });
  }

  resetVenta(){
    this.new_sale = {}
  }

  addVenta(ref: any){
    console.log(`AddVenta - New sale: ${this.new_sale}`);
    this.saleService.addSale(this.new_sale)
    .subscribe(resp =>{
      if(resp.ok === true){
        console.log(`AddVenta - Response: ${resp}`)
        ref.close()
        this.toastMixin.fire({
          title: 'Venta completada'
        });
        this.resetVenta()
      }else{
        Swal.fire('Error', resp, 'error')
      }
    })
  }

  updateVenta(sale:SalesBody, ref: any){
    let id = sale._id || ''

    this.saleService.updateSale(id, sale).subscribe(resp =>{
      if(resp.ok === true){
        ref.close()
        this.toastMixin.fire({
          title: 'Venta actualizada'
        });
        this.resetVenta()
      }else{
        Swal.fire('Error', resp.msg, 'error')
      }
    })
  }

  getVenta(id:string){
    this.modalEdit = true;
    this.saleService.getSale(id).subscribe(resp => {
      if (resp.ok === true){
        console.log(`getVenta - Response: ${resp}`);
        this.new_sale = resp.venta
      }else{
      console.log('error', resp)
      Swal.fire('Error', resp, 'error')
      }
    })
  }

  deleteVenta(id:string){
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
        this.saleService.deleteSale(id).subscribe(resp =>{
        if(resp.ok === true){
          this.toastMixin.fire({
            title: 'Venta eliminada'
          });
        }else{
          Swal.fire('Error', resp, 'error')
        }
      })
    }
  })
  }

  addSaleProduct(search:string){
    this.productService.searchProducts(search).subscribe(resp =>{
      if(resp.count > 0){
        console.log(`addSaleProduct - Response: ${resp.results}`);
      }
    })
    // this.new_sale_product = 
  }

  removeSaleProduct(id:string){
    this.sale_products = this.sale_products.filter(product => product.id_producto !== id)
    // this.new_sale_product = 
  }

  quantityProduct(_case_:string, id:string){
    if(_case_ === 'inc'){
      this.sale_products.forEach(product =>{
        if(product.id_producto === id){
          if(product.cantidad)
            product.cantidad ++
        }
      })
    }else{
      this.sale_products.forEach(product =>{
        if(product.id_producto === id){
          if(product.cantidad)
            product.cantidad --
        }
      })
    }
  }

  discountPerProduct(discount:number, id:string){
    if (discount > 0)
      this.sale_products.forEach(product =>{
        if(product.id_producto === id){
          if(product.precio){
            discount *= product.precio / 100
            product.precio -= discount 
          }
        }
      })
  }

  getTotalAmount(){
    this.total_amount = this.sale_products.reduce((accumulator, object) => {
      return accumulator + (object.precio || 0);
    }, 0);
  }
  
  discountTotalAmount(discount:number){
    discount *= this.total_amount / 100
    this.total_amount -= discount
  }

  // TODO: Generate sale code based on date time

  fruits = ['manzana', 'naranja', 'uvas']
}
