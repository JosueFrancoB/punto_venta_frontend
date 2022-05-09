import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { NbDialogService } from '@nebular/theme';
import { map, Observable, of } from 'rxjs';
import { environment } from 'src/environments/environment';
import Swal from 'sweetalert2';
import { ProductsPurchasesSales, SalesBody } from '../../interfaces/protected-interfaces';
import { ClientesService } from '../../services/clientes.service';
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
  product_search:string = ''
  customer_search:string = ''
  total_amount:number = 0
  new_sale:SalesBody = {}
  sales:Array<SalesBody> = []
  new_sale_product:ProductsPurchasesSales = {}
  sale_products:Array<any> = []
  filteredProductOptions$!: Observable<string[]>;
  filteredCustomerOptions$!: Observable<string[]>;
  products_options:Array<string> = []
  customers_options:Array<string> = []
  @ViewChild('productInput') productInput: any;
  @ViewChild('customerInput') customerInput: any;
  @ViewChild('dateSale') dateSale: any;
  products_objects:Array<ProductsPurchasesSales> = []
  uploadsUrl:string = environment.baseUrl + '/uploads/productos'

  constructor(private dialogService: NbDialogService,
              private saleService: SalesService,
              private productService: ProductsService,
              private clientsService:ClientesService) { 
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
    console.log('reset');
  }

  getVentas(){
    this.saleService.getSales().subscribe(resp => {
      if (resp.ok === true){
        console.log(`getVentas - Response: ${resp}`);
        this.sales = resp.ventas
      }else{
      console.log('error', resp)
      Swal.fire('Error', resp, 'error')
      }
    })
  }

  addVenta(ref: any){
    this.new_sale.productos = this.sale_products
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

  addSaleProduct(){
    if(!this.product_search) 
      return
    let products = this.products_objects.filter(prod => prod.nombre && prod.nombre.toLowerCase() === this.product_search.toLowerCase())
    if(products.length <= 0){
      Swal.fire(`El producto ${this.product_search} no existe`, 'Por favor, agreguelo primero en la sección de productos', 'error')
    }else{
      products.forEach((prod)=>{
        prod.cantidad = 1
        prod.amount = prod.precio
        if (!this.sale_products.includes(prod)) {
          this.sale_products.push(prod)
          this.getTotalAmount()
        }
      })
      console.log('Los product added');
      
    }
  }

  removeSaleProduct(id:string){
    this.sale_products = this.sale_products.filter(product => product._id !== id)
    this.getTotalAmount()
    // this.new_sale_product = 
  }

  quantityProduct(_case_:string, id:string|undefined){
    this.getTotalAmount()
    if(_case_ === 'inc'){
      console.log('increment');
      this.sale_products.forEach(product =>{
        if(product._id === id){
          if(product.cantidad != undefined){
            product.cantidad ++
            product.amount = product.precio * product.cantidad
            console.log(product.precio);
            this.getTotalAmount()
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
          }
        }
      })
    }else{
      this.sale_products.forEach(product =>{
        if(product._id === id){
          if(product.cantidad && product.cantidad >= 1){
            // product.cantidad --
            product.amount = product.precio * product.cantidad
            this.getTotalAmount()
          }
        }
      })
    }
  }

  discountPerProduct(discount:number, id:string){
    if (discount > 0)
      this.sale_products.forEach(product =>{
        if(product._id === id){
          if(product.precio){
            discount *= product.precio / 100
            product.precio -= discount 
          }
        }
      })
  }

  getTotalAmount(){
    this.total_amount = this.sale_products.reduce((accumulator, object) => {
      return accumulator + (object.precio * object.cantidad || 0);
    }, 0);
  }
  
  discountTotalAmount(discount:number){
    if (discount > 0){
      discount *= this.total_amount / 100
      this.total_amount -= discount
    }
  }

  // TODO: Generate sale code based on date time

  fruits = ['manzana', 'naranja', 'uvas']


  //+ Buscar Clientes y productos //

  onProductSelectChange($event:any){
    this.filteredProductOptions$ = this.getFilteredOptions($event, this.products_options);
    this.product_search = $event
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
              console.log(`searchProducts - Response:`);
              let products = resp.results
              console.log(products);
              this.products_objects = products
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
              console.log(`searchClientes - Response:`);
              let customers = resp.results
              this.customers_options = customers.map((customer:any)=> customer.nombre)
              console.log(this.customers_options);
            }
          })
          this.filteredCustomerOptions$ = this.getFilteredOptions(this.customerInput.nativeElement.value, this.customers_options);
        }
        break;
      default:
        break;
    }
  }

}
