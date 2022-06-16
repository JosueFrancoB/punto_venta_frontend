import { Component, OnInit, TemplateRef } from '@angular/core';
import { NbDialogService } from '@nebular/theme';
import { Observable, of } from 'rxjs';
import { environment } from 'src/environments/environment';
import Swal from 'sweetalert2';
import { ProductosBody, ProductsPurchases, PurchasesBody, UnitsBody } from '../../interfaces/protected-interfaces';
import { ProductsService } from '../../services/products.service';
import { PurchasesService } from '../../services/purchases.service';
import { UnitsService } from '../../services/units.service';
import { UsersService } from '../../services/users.service';

@Component({
  selector: 'app-purchases',
  templateUrl: './purchases.component.html',
  styleUrls: ['./purchases.component.scss']
})
export class PurchasesComponent implements OnInit {

  date: any
  termino: string = ''
  total_taxes:number = 0
  total_discount:number = 0
  toastMixin: any
  modalEdit: boolean = false
  modalLoading: boolean = false
  searchText:string = ''
  total_amount:any = 0
  current_total_amount:number = 0
  new_purchase:PurchasesBody = {productos: []}
  purchases:Array<PurchasesBody> = []
  search_products!:ProductsPurchases[];
  uploadsUrl:string = environment.baseUrl + '/uploads/productos'
  filter_products: string = 'nombre'
  filter_purchase: string = 'fecha'
  show_purchases = false
  purchase_details:PurchasesBody = {productos:[]} 

  constructor(private dialogService: NbDialogService,
              private purchaseService: PurchasesService,
              private productService: ProductsService,
              private unitsService: UnitsService,
              private userService: UsersService) { 
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
    this.today();
  }

  toggleShow(){
    this.show_purchases = !this.show_purchases
    if(this.show_purchases)
      this.getCompras()
  }

  openDialog(dialog: TemplateRef<any>, closeOnBackdropClick: boolean) {
    this.dialogService.open(dialog, { closeOnBackdropClick });
  }

  buscando(){
    if (!this.termino){
      this.search_products = []
      return
    }
    
    this.productService.searchProducts(this.termino, this.filter_products)
    .subscribe(resp => {
      if(resp.count > 0){
        this.search_products = resp.results
      }
    })
  }

  changeDate($event:any){
    this.date = $event
  }

  today(){
    this.date = new Date();
  }

  getUnit(unidad:string){
    return new Promise<any>((resolve, reject) => {
      this.unitsService.getUnidad(unidad)
      .subscribe(resp=> resp.ok ? resolve(resp.unidad) : resolve(undefined))
    })
    
  }

  async addProdutToPurchase(req_product:ProductosBody){
    if (!req_product) return
    let new_product:ProductsPurchases = {}
    const {precio_compra: precio, inventario_max, inventario_min, ...product} = req_product
    new_product = product
    new_product.precio = precio
    // Para que no se guarden repetidos
    const index = this.new_purchase.productos.findIndex(object => object._id === new_product._id);
    this.termino = ''
    this.search_products = []
    if(new_product && index === -1){
      let unit_compra:UnitsBody = await this.getUnit(new_product.unidad_compra!)
      let unit_venta:UnitsBody = await this.getUnit(new_product.unidad_venta!)
      console.log('unidad compra', unit_compra);
      new_product.unidad_compra = unit_compra.nombre
      new_product.unidad_venta = unit_venta.nombre
      new_product.cantidad = 1
      new_product.amount = new_product.precio
      this.new_purchase.productos?.push(new_product)
      console.log('products: ',this.new_purchase.productos);
      this.getTotalAmount()
    }
  }

  removeProductFromPurchase(id:string){
    this.new_purchase.productos = this.new_purchase.productos?.filter(product => product._id !== id)
    this.getTotalAmount()
  }

  resetCompra(){
    this.new_purchase = {productos:[]}
    this.total_amount = 0
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

  endCompra(){
    this.new_purchase.usuario_compra = {id_usuario: ''}
    this.new_purchase.usuario_compra = {nombre: ''}
    this.userService.validateJWT().subscribe(resp=>{
      if(resp.ok){
        this.new_purchase.usuario_compra!.id_usuario = resp.usuario.uid
        this.new_purchase.usuario_compra!.nombre = resp.usuario.nombre
        this.new_purchase.fecha = this.date
        this.new_purchase.total_compra = this.total_amount
        this.addCompra()
      }
    })
  }
  addCompra(){
    this.purchaseService.addPurchase(this.new_purchase)
    .subscribe(resp =>{
      if(resp.ok === true){
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
          this.getCompras()
        }else{
          Swal.fire('Error', resp, 'error')
        }
      })
    }
  })
  }

  viewPurchase(ref:any, purchase:PurchasesBody){
    this.purchase_details = purchase
    this.openDialog(ref,true)
  }

  tagsStock(product:any){
    return product.existencias ? true : false
  }
  getTotalAmount(){
    this.total_amount = this.new_purchase.productos?.reduce((accumulator, product) => {
      return accumulator + (product.precio! * product.cantidad! || 0);
    }, 0);
    this.current_total_amount = this.total_amount
  }

  quantityProduct(_case_:string, id:string|undefined){
    this.getTotalAmount()
    if(_case_ === 'inc'){
      this.new_purchase.productos?.forEach(product =>{ 
        if(product._id === id){
          product.cantidad! ++
          product.amount = product.precio! * product.cantidad!
          this.getTotalAmount()
        }
      })
    }else if(_case_ === 'dec'){
      this.new_purchase.productos?.forEach(product =>{
        if(product._id === id && product.cantidad! > 1){
          product.cantidad! --
          product.amount = product.precio! * product.cantidad!
          this.getTotalAmount()
        }
      })
    }else{
      this.new_purchase.productos?.forEach(product =>{
        if(product._id === id && product.cantidad! >= 1){
            product.amount = product.precio! * product.cantidad!
            this.getTotalAmount()
          }
      })
    }
  }

}
