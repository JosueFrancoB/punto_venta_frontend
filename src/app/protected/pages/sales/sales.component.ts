import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { NbDialogService } from '@nebular/theme';
import { Observable, of } from 'rxjs';
import { environment } from 'src/environments/environment';
import Swal from 'sweetalert2';
import { CustomerSales, ProductosBody, ProductsSales, ProveedoresBody, SalesBody, UnitsBody } from '../../interfaces/protected-interfaces';
import { ClientesService } from '../../services/clientes.service';
import { ProductsService } from '../../services/products.service';
import { SalesService } from '../../services/sales.service';
import { UnitsService } from '../../services/units.service';
import { UsersService } from '../../services/users.service';

@Component({
  selector: 'app-purchases',
  templateUrl: './sales.component.html',
  styleUrls: ['./sales.component.scss']
})
export class SalesComponent implements OnInit {

  date: any;
  limit:number= 5;
  itemsPerPage: number = 5;
  paginaActual!:number;
  total_items:number = 0;
  pay:number = 0
  taxes:number = 0
  discount:number = 0
  viewLoading:boolean = false
  sale_discount:number = 0
  search_product: string = ''
  total_taxes:number = 0
  total_discount:number = 0
  toastMixin: any
  modalEdit: boolean = false
  modalLoading: boolean = false
  searchText:string = ''
  total_amount:any = 0
  current_total_amount:number = 0
  new_sale:SalesBody = {productos: []}
  sales:Array<SalesBody> = []
  search_products!:ProductsSales[];
  uploadsUrl:string = environment.baseUrl + '/uploads/productos'
  filter_products: string = 'nombre'
  filter_sale: string = 'all'
  show_sales = false
  search_customers:CustomerSales[] = []
  search_customer:string = ''
  selected_customer:CustomerSales = {}
  sale_details:SalesBody = {productos:[]} 
  @ViewChild('Venta') Venta!: TemplateRef<any>;
  constructor(private dialogService: NbDialogService,
              private salesService: SalesService,
              private productService: ProductsService,
              private customerService: ClientesService,
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
    this.show_sales = !this.show_sales
    if(this.show_sales)
      this.getVentas()
  }

  openDialog(dialog: TemplateRef<any>, closeOnBackdropClick: boolean) {
    this.dialogService.open(dialog, { closeOnBackdropClick });
  }

  cambioPagina(event:any){
    this.paginaActual = event
    let from = (this.paginaActual - 1) * this.itemsPerPage
    this.getVentas(from)
  }

  searchVenta(){
    this.getVentas(0,this.searchText,this.filter_sale)
  }

  searchProduct(){
    if (!this.search_product){
      this.search_products = []
      return
    }
    
    this.productService.searchProducts(this.search_product, this.filter_products)
    .subscribe(resp => {
      if(resp.count > 0){
        this.search_products = resp.results
      }
    })
  }

  searchCustomer(){
    if(!this.search_customer) {
      this.search_customers = []
      return
    }

    this.customerService.searchClientes(this.search_customer)
    .subscribe(resp => {
      if(resp.count > 0){
        this.search_customers = resp.results
      }
    })
  }

  addSaleCustomer(req_customer:ProveedoresBody){
      if (!req_customer) return
      this.search_customer = ''
      const {telefonos, correos, rfc, direcciones, ...customer} = req_customer
      this.selected_customer = customer
    }

  addCustomer(){
    if (Object.keys(this.selected_customer).length === 0) return
    this.new_sale.cliente = this.selected_customer
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

  async addProductToSale(req_product:ProductosBody){
    if (!req_product) return
    let new_product:ProductsSales = {}
    const {precio_compra: precio, inventario_max, inventario_min, ...product} = req_product
    new_product = product
    new_product.precio = precio
    // Para que no se guarden repetidos
    const index = this.new_sale.productos?.findIndex(object => object._id === new_product._id);
    this.search_product = ''
    this.search_products = []
    if(new_product && index === -1){
      let unit_venta:UnitsBody = await this.getUnit(new_product.unidad_venta!)
      new_product.unidad_venta = unit_venta.nombre
      new_product.cantidad = 1
      new_product.amount = new_product.precio
      this.new_sale.productos?.push(new_product)
      console.log('products: ',this.new_sale.productos);
      this.getTotalAmount()
    }
  }

  removeProductFromSale(id:string){
    this.new_sale.productos = this.new_sale.productos?.filter(product => product._id !== id)
    this.getTotalAmount()
  }

  resetVenta(){
    this.new_sale = {productos:[]}
    this.total_amount = 0
    this.discount = 0
    this.sale_discount = 0
    this.pay = 0
    this.taxes = 0
    this.selected_customer = {}
  }

  getVentas(from:number=0,search:string='', searchField:string=''){
    let limite = this.limit
    this.viewLoading = true
    this.salesService.getSales(limite,from, search, searchField).subscribe(resp => {
      if (resp.ok === true){
        console.log(`getVentas - Response: ${resp}`);
        this.sales = resp.ventas
        this.total_items = resp.total
        this.viewLoading = false
      }else{
      console.log('error', resp)
      Swal.fire('Error', resp, 'error')
      }
    })
  }

  NoProdConflicts(){
    return new Promise<boolean>((resolve, reject) => {
      let prod_conflicts = this.new_sale.productos?.filter(prod => prod.existencias! <= 0 || (prod.cantidad! > prod.existencias!))
      if(prod_conflicts![0] !== undefined){
        Swal.fire({
          title: `No hay suficientes existencias de los productos ${JSON.stringify(prod_conflicts).replace('[', '').replace(']','').replace('null','')}, el inventario no se verá afectado en esos productos, ¿Desea continuar con la venta?`,
          icon: 'warning',
          showCancelButton: true,
          confirmButtonColor: '#3085d6',
          cancelButtonColor: '#d33',
          cancelButtonText: 'Cancelar',
          confirmButtonText: 'Confirmar'
        }).then((result) => {
          if(result.isConfirmed){
            // Continue? Yes
            resolve(true)
          }else{
            // Continue? No
            resolve(false)
          }
      })
      }else{
        // Continue? Yes
        resolve(true)
      }
    })
  }
  
  applyDiscount(){
    return new Promise<boolean>((resolve, reject) => {
      if (this.sale_discount > 0){
        let discount = this.total_amount - (this.discount * this.total_amount) / 100
        Swal.fire({
          title: `La venta tiene aplicado un descuento de ${this.sale_discount}%, el monto total de la venta es de $${discount.toFixed(2)}, ¿Desea continuar con la venta?`,
          icon: 'warning',
          showCancelButton: true,
          confirmButtonColor: '#3085d6',
          cancelButtonColor: '#d33',
          cancelButtonText: 'Cancelar',
          confirmButtonText: 'Confirmar'
        }).then((result) => {
          if(result.isConfirmed){
            // Continue? Yes
            this.total_amount -= (this.discount * this.total_amount) / 100
            this.total_amount = this.total_amount.toFixed(2)
            resolve(true)
          }else{
            // Continue? No
            resolve(false)
          }
      })
      }else{
        // Continue? Yes
        resolve(true)
      }
    })
  }

  async endVenta(ref:any){
      if(this.pay < this.total_amount){
        Swal.fire(`Monto Incompleto`, 'El monto del pago es incompleto', 'error')
      }else{
        let no_conflicts = await this.NoProdConflicts()
        if(no_conflicts === true){
          this.new_sale.usuario_venta = {id_usuario: ''}
          this.new_sale.usuario_venta = {nombre: ''}
          this.userService.validateJWT().subscribe(resp=>{
            if(resp.ok){
              this.new_sale.usuario_venta!.id_usuario = resp.usuario.uid
              this.new_sale.usuario_venta!.nombre = resp.usuario.nombre
              this.new_sale.fecha = this.date
              this.new_sale.total_a_pagar = this.total_amount
              this.new_sale.descuento = this.sale_discount
              this.addVenta(ref)
            }
          })
      }
    }
  }

  addVenta(ref:any){
    this.salesService.addSale(this.new_sale)
    .subscribe(resp =>{
      if(resp.ok === true){
        this.toastMixin.fire({
          title: 'Venta completada'
        });
        ref.close()
        this.resetVenta()
      }else{
        Swal.fire('Error', resp, 'error')
      }
    })
  }

  updateVenta(sale:SalesBody, ref: any){
    let id = sale._id || ''

    this.salesService.updateSale(id, sale).subscribe(resp =>{
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
    this.salesService.getSale(id).subscribe(resp => {
      if (resp.ok === true){
        console.log(`getSale - Response: ${resp}`);
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
        this.salesService.deleteSale(id).subscribe(resp =>{
        if(resp.ok === true){
          this.toastMixin.fire({
            title: 'Venta eliminada'
          });
          this.getVentas()
        }else{
          Swal.fire('Error', resp, 'error')
        }
      })
    }
  })
  }

  viewSale(ref:any, sale:SalesBody){
    this.sale_details = sale
    this.openDialog(ref,true)
  }

  tagsStock(product:any){
    return product.existencias ? true : false
  }
  getTotalAmount(){
    this.total_amount = this.new_sale.productos?.reduce((accumulator, product) => {
      return accumulator + (product.precio! * product.cantidad! || 0);
    }, 0);
    this.current_total_amount = this.total_amount
  }

  quantityProduct(_case_:string, id:string|undefined){
    this.getTotalAmount()
    if(_case_ === 'inc'){
      this.new_sale.productos?.forEach(product =>{ 
        if(product._id === id){
          product.cantidad! ++
          product.amount = product.precio! * product.cantidad!
          this.getTotalAmount()
        }
      })
    }else if(_case_ === 'dec'){
      this.new_sale.productos?.forEach(product =>{
        if(product._id === id && product.cantidad! > 1){
          product.cantidad! --
          product.amount = product.precio! * product.cantidad!
          this.getTotalAmount()
        }
      })
    }else{
      this.new_sale.productos?.forEach(product =>{
        if(product._id === id && product.cantidad! >= 1){
            product.amount = product.precio! * product.cantidad!
            this.getTotalAmount()
          }
      })
    }
  }

  async questionDiscount(){
    if (this.sale_discount > 0){
      let apply_discount = await this.applyDiscount()
      if (!apply_discount) return
    }
    this.openDialog(this.Venta, true);
  }
 

  resetDiscount(){
    this.sale_discount = 0
    this.discount = 0
  }

  addDiscount(){
    this.sale_discount = this.discount
  }

}
