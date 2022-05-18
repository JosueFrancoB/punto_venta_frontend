import { ChangeDetectorRef, Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { NbDialogService } from '@nebular/theme';
import { map, Observable, of } from 'rxjs';
import { environment } from 'src/environments/environment';
import Swal from 'sweetalert2';
import { ProductsPurchasesSales, SalesBody, UserSales } from '../../interfaces/protected-interfaces';
import { ClientesService } from '../../services/clientes.service';
import { ProductsService } from '../../services/products.service';
import { SalesService } from '../../services/sales.service';
import { UsersService } from '../../services/users.service';

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
  temp_amount:any 
  discountsArray:any = []
  totalDiscountArray:any = []
  taxesArray:any = []
  product_search:string = ''
  customer_search:string = ''
  total_amount:number = 0
  date: any
  current_total_amount:number = 0
  user_sale:UserSales = {}
  new_sale:SalesBody = {}
  sales:Array<SalesBody> = []
  new_sale_product:any = {}
  sale_products:Array<any> = []
  temp_products:Array<any> = []
  filteredProductOptions$!: Observable<string[]>;
  filteredCustomerOptions$!: Observable<string[]>;
  products_options:Array<string> = []
  customers_options:Array<string> = []
  pay:number = 0
  total_discount:number = 0
  total_taxes:number = 0
  discount_product:number = 0
  @ViewChild('productInput') productInput: any;
  @ViewChild('customerInput') customerInput: any;
  @ViewChild('dateSale') dateSale: any;
  @ViewChild('AddDiscount') AddDiscount!: TemplateRef<any>;
  @ViewChild('Venta') Venta!: TemplateRef<any>;
  @ViewChild('TotalDiscount') TotalDiscount!: TemplateRef<any>;
  products_objects:Array<ProductsPurchasesSales> = []
  customers_objects:any = []
  uploadsUrl:string = environment.baseUrl + '/uploads/productos'
  products_conflicts:boolean = false

  constructor(private dialogService: NbDialogService,
              private saleService: SalesService,
              private productService: ProductsService,
              private clientsService:ClientesService,
              private userService:UsersService,
              private cd: ChangeDetectorRef) { 
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
    this.getVentas()
  }

  openDialog(dialog: TemplateRef<any>, closeOnBackdropClick: boolean) {
    this.dialogService.open(dialog, { closeOnBackdropClick });
  }

  resetVenta(){
    this.new_sale = {}
    this.sale_products = []
    this.total_amount = 0
    this.total_discount = 0
    this.total_taxes = 0
    this.pay = 0
  }

  getVentas(){
    this.saleService.getSales().subscribe(resp => {
      if (resp.ok === true){
        console.log(resp);
        this.sales = resp.ventas
      }else{
      Swal.fire('Error', resp, 'error')
      }
    })
  }

  NoProdConflicts(){
    return new Promise<boolean>((resolve, reject) => {
      let prod_conflicts = this.sale_products.map(prod =>{
        if(prod.existencias <= 0)
          return prod.nombre
      })
      if(prod_conflicts[0] !== undefined){
        Swal.fire({
          title: `No hay existencias de los productos ${JSON.stringify(prod_conflicts).replace('[', '').replace(']','')}, el inventario no se verá afectado en esos productos, ¿Desea continuar con la venta?`,
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

  async addVenta(ref: any){
    if(this.pay < this.total_amount){
      Swal.fire(`Monto Incompleto`, 'El monto del pago es incompleto', 'error')
    }else{
      let no_conflicts = await this.NoProdConflicts()
      if(no_conflicts === true){
        this.new_sale.productos = this.sale_products
        this.saleService.addSale(this.new_sale)
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
    }
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
        this.new_sale = resp.venta
      }else{
      Swal.fire('Error', resp, 'error')
      }
    })
  }

  deleteVenta(id:any){
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
          this.getVentas()
        }else{
          Swal.fire('Error', resp, 'error')
        }
      })
    }
  })
  }

  addSaleProduct(product_value:string){
    if(!product_value) 
      return
    let products = this.products_objects.filter(prod => prod.nombre && prod.nombre.trim().toLowerCase() === product_value.trim().toLowerCase())
    if(products.length <= 0){
      Swal.fire(`El producto ${product_value} no existe`, 'Por favor, agreguelo primero en la sección de productos', 'error')
    }else{
      products.forEach((prod)=>{
        prod.cantidad = 1
        prod.amount = prod.precio
        let current_products = this.sale_products.filter(prod => prod.nombre.trim().toLowerCase() === product_value.trim().toLowerCase())
        if (current_products.length <= 0) {
          this.sale_products.push(prod)
          this.temp_products.push(prod)
          this.getTotalAmount()
          if(this.total_discount > 0)
            this.discountTotalAmount()
          if(this.total_taxes > 0)
            this.applyTaxes()
          
        }
      })
    }
  }

  addSaleClient(){
    if(!this.customer_search) 
      return

    let customers = this.customers_objects.filter((customer:any) => customer.nombre && customer.nombre.trim().toLowerCase() === this.customer_search.trim().toLowerCase())
    if(customers.length <= 0){
      Swal.fire(`El cliente ${this.customer_search} no existe`, 'Por favor, agreguelo primero en la sección de clientes', 'error')
    }else{
      customers.forEach((customer:any) => {
        console.log('customer', customer);
        this.new_sale.cliente = customer
      });
    }

    
  }

  removeSaleProduct(id:string){
    this.sale_products = this.sale_products.filter(product => product._id !== id)
    this.temp_products = this.temp_products.filter(product => product._id !== id)
    this.new_sale_product = {}
    this.getTotalAmount()
  }

  quantityProduct(_case_:string, id:string|undefined){
    this.getTotalAmount()
    if(_case_ === 'inc'){
      this.sale_products.forEach(product =>{
        if(product._id === id){
          if(product.cantidad != undefined){
            product.cantidad ++
            product.amount = product.precio * product.cantidad
            this.getTotalAmount()
            if(this.total_discount > 0)
              this.discountTotalAmount()
            if(this.total_taxes > 0)
              this.applyTaxes()
          }
        }
      })
    }else if(_case_ === 'dec'){
      this.sale_products.forEach(product =>{
        if(product._id === id){
          if(product.cantidad && product.cantidad > 1){
            product.cantidad --
            product.amount = product.precio * product.cantidad
            this.getTotalAmount()
            if(this.total_discount > 0)
              this.discountTotalAmount()
            if(this.total_taxes > 0)
              this.applyTaxes()
          }
        }
      })
    }else{
      this.sale_products.forEach(product =>{
        if(product._id === id){
          if(product.cantidad && product.cantidad >= 1){
            product.amount = product.precio * product.cantidad
            this.getTotalAmount()
          }
        }
      })
    }
  }

  discountPerProduct(id:string){
    console.log(this.temp_products);
    this.discount_product = Number(this.discountsArray[0])
    if (this.discount_product > 0){
      this.sale_products.forEach(product =>{
        if(product._id === id && product.precio){
          product.discount = this.discount_product
          this.discount_product *= product.precio / 100
          this.temp_amount = this.temp_products.filter(temp_prod => temp_prod._id === id && temp_prod.amount !== product.amount)
          if(this.temp_amount.length <=0){
            product.amount -= this.discount_product
          }
          else{
            product.amount = this.temp_amount[0].amount - this.discount_product
          }
        }
      })
      this.discountsArray = []
    }
  }

  getTotalAmount(){
    this.total_amount = this.sale_products.reduce((accumulator, object) => {
      return accumulator + (object.precio * object.cantidad || 0);
    }, 0);
    this.current_total_amount = this.total_amount
  }
  
  discountTotalAmount(){
    let current_amount = 0
    this.total_discount = Number(this.totalDiscountArray[0])
    if(this.total_taxes > 0 && this.total_discount > 0){
      current_amount = this.total_amount
    }else{
      current_amount = this.current_total_amount
    }
    if(this.total_amount > 0){
      if (this.total_discount > 0){
        let discount = this.total_discount
        this.total_amount = current_amount
        discount *= this.total_amount / 100
        this.total_amount -= discount
      }
    }
  }

  discountModal(_case_:string, product:any){
    this.discountsArray = []
    switch (_case_) {
      case 'product':
        this.new_sale_product = product
        this.openDialog(this.AddDiscount, true)
        break;
      case 'total':
        this.openDialog(this.TotalDiscount, true)
        break;
      default:
        break;
    }
  }

  applyTaxes(){
    let current_amount = 0
    this.total_taxes = Number(this.taxesArray[0])
    if(this.total_taxes > 0 && this.total_discount > 0){
      current_amount = this.total_amount
    }else{
      current_amount = this.current_total_amount
    }
    if(this.total_amount > 0){
      if (this.total_taxes > 0){
        let taxes = this.total_taxes
        this.total_amount = current_amount
        taxes *= this.total_amount / 100
        this.total_amount += taxes
      }
    }
  }

  today(){
    this.date = new Date();
  }

  changeDate($event:any){
    this.date = $event
  }

  endSale(ref:any){
    this.new_sale.total_a_pagar = this.total_amount
    this.new_sale.descuento = this.total_discount
    this.new_sale.productos = this.sale_products
    this.new_sale.iva = this.total_taxes
    this.new_sale.fecha = this.date
    this.userService.validateJWT().subscribe(resp=>{
      if(resp.ok){
        this.user_sale.id_usuario = resp.usuario.uid
        this.user_sale.nombre = resp.usuario.nombre
        this.new_sale.usuario_venta = this.user_sale
        this.addVenta(ref)
      }
    })
  }


  //+ Buscar Clientes y productos //

  onProductSelectChange($event:any){
    this.filteredProductOptions$ = this.getFilteredOptions($event, this.products_options);
    this.addSaleProduct($event)
  }

  onCustomerSelectChange($event:any){
    this.filteredCustomerOptions$ = this.getFilteredOptions($event, this.customers_options);
    this.customer_search = $event
  }

  private filter(value: string, array_values:Array<any>): string[] {
    if (value){
      let filterValue = value.toLowerCase();
      return array_values.filter(optionValue => optionValue.toLowerCase().includes(filterValue));
    }
    return array_values
  }

  getFilteredOptions(value: string, array_values:Array<any>): Observable<string[]> {
    return of(value).pipe(
      map(filterString => this.filter(filterString, array_values)),
    );
  }

  onChange(field:string){
    switch (field) {
      case 'product':
        let search_prod = this.productInput.nativeElement.value
        if(search_prod.length >= 2){
          this.productService.searchProducts(search_prod).subscribe(resp =>{
            if(resp.count > 0){
              let products = resp.results
              this.products_objects = products.map(( prod:any ) =>{
                let {_id, nombre, precio_venta: precio, existencias, img} = prod
                return {_id, nombre, precio, existencias, img}
              })
              this.products_options = products.map((prod:any)=> prod.nombre)
              this.filteredProductOptions$ = this.getFilteredOptions(this.productInput.nativeElement.value, this.products_options);
            }
          })
        }
        break;
      case 'customer':
        let search_cust = this.customerInput.nativeElement.value
        if(search_cust.length >= 2){
          this.clientsService.searchClientes(search_cust).subscribe(resp =>{
            if(resp.count > 0){
              this.customers_objects = resp.results.map(( customer:any ) =>{
                let {_id, nombre, nombre_empresa} = customer
                return {_id, nombre, nombre_empresa}
              })
              this.customers_options = this.customers_objects.map((customer:any)=> customer.nombre)
              this.filteredCustomerOptions$ = this.getFilteredOptions(this.customerInput.nativeElement.value, this.customers_options);
            }
          })
        }
        break;
      default:
        break;
    }
  }

  groupDiscounts(value:any): void {
    this.discountsArray = value;
    this.cd.markForCheck();
  }

  groupTotalDiscount(value:any): void {
    this.totalDiscountArray = value;
    this.cd.markForCheck();
  }

  groupTaxes(value:any): void {
    this.taxesArray = value;
    this.cd.markForCheck();
  }

  tagsStock(product:any){
    if (product.existencias) { 
      return true
    }
    else{
      return false
    }
  }
}
