import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { LocalDataSource } from 'ng2-smart-table';
import Swal from 'sweetalert2';
import { ProductsService } from '../../services/products.service';
import { CategoriasService } from '../../services/categorias.service';
import { ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NbDialogService, NbTagComponent, NbTagInputAddEvent } from '@nebular/theme';
import { UploadsService } from '../../services/uploads.service';
import { ProductosBody, ProveedoresBody, UnitsBody } from '../../interfaces/protected-interfaces';
import { UnitsService } from '../../services/units.service';
import { environment } from 'src/environments/environment';
import { map, Observable, of } from 'rxjs';
import { ProveedoresService } from '../../services/proveedores.service';
import { WarehouseService } from '../../services/warehouse.service';
import { UsersService } from '../../services/users.service';

@Component({
  selector: 'app-products',
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.scss']
})
export class ProductsComponent implements OnInit{

  // categorias: Array<string> = []
  toastMixin: any;
  productos: Array<ProductosBody> = [];
  source: LocalDataSource;
  params: any;
  modalEdit: boolean = false
  modalLoading: boolean = false
  viewLoading: boolean = false
  addLoading: boolean = false
  updLoading: boolean = false
  delLoading: boolean = false
  title:string = ''
  categoria:string = ''
  selectedCategory:string =  ''
  product: ProductosBody = {}
  new_producto: ProductosBody = {}
  productSrc = ''
  changesEdit = true
  changeImg = true
  product_selected = false
  product_edit = ''
  products_units: Array<any> = []
  products_providers: Array<any> = []
  products_warehouses: Array<any> = []
  section_general:boolean = true
  section_adicional:boolean = false
  section_personalizar:boolean = false
  uploadsUrl:string = environment.baseUrl + '/uploads/productos'
  new_unit:UnitsBody = {}
  addUnit:boolean = false
  unit_exists:string = '' 
  unit_compra_id:Array<any> = []
  unit_venta_id:Array<any> = []
  unit_value = {compra: '', venta: '', compra_abv:'', venta_abv: ''} 
  provider_value = ''
  warehouse_value = ''
  new_provider: ProveedoresBody = {}
  current_category:string = ''
  current_unit_gen:string = this.unit_value.venta_abv
  current_unit_inv:string = this.unit_value.venta_abv

  current_inv = {min:0,max:0}
  current_existencias:number = 0
  user_rol:any = {}

  @ViewChild('Producto') Producto!: TemplateRef<any>;
  @ViewChild('AddUnit') AddUnit!: TemplateRef<any>;

  options_units: string[] = [];
  options_providers: string[] = [];
  options_warehouses: string[] = [];
  filteredCompraOptions$!: Observable<string[]>;
  filteredVentaOptions$!: Observable<string[]>;
  filteredProviderOptions$!: Observable<string[]>;
  filteredWarehouseOptions$!: Observable<string[]>;
  @ViewChild('unitCompraInput') unitCompraInput: any;
  @ViewChild('unitVentaInput') unitVentaInput: any;
  @ViewChild('providerInput') providerInput: any;
  @ViewChild('warehouseInput') warehouseInput: any;

  constructor(private productsService: ProductsService,
              private categoriasService: CategoriasService,
              private unitsService: UnitsService,
              private providerService: ProveedoresService,
              private warehouseService: WarehouseService,
              private usersService: UsersService,
              private dialogService: NbDialogService,
              private uploadsService: UploadsService,
              private fb: FormBuilder,
              private activatedRoute: ActivatedRoute) {
    this.source = new LocalDataSource(this.productos);
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
  
  addProductForm: FormGroup = this.fb.group({
    nombre: ['', [Validators.required] ],
    categoria: ['', [Validators.required] ]
  })

  ngOnInit() {
    this.params = this.activatedRoute.snapshot.params;
    if(this.params.id){
      this.getProducts(this.params.id)
      this.getCategory(this.params.id)
    }
    this.settings.pager.display = true;
    this.settings.pager.perPage = 15;
    
  }

  getProducts(id: string){
    this.categoria = id
    this.viewLoading = true
    this.productsService.getProductsByCategoria(id).subscribe(res =>{
      const {productos} = res
      this.productos = productos
      this.source.load(productos)
      this.viewLoading = false
    })
  }

  editClickedProduct(id: string|undefined){
    
    this.viewLoading = true
    if (id !== undefined)
      this.productsService.getProduct(id).subscribe(resp =>{
        if (resp.ok === true){
          this.productSrc = this.uploadsUrl + '/' + resp.producto._id
          this.modalEdit = true
          this.new_producto = resp.producto
          if (this.new_producto.categoria){
            this.current_category = resp.producto.categoria.nombre
          }
          console.log(this.new_producto);
          this.getUserRol()
          this.getUnitEditById()
          this.getEditProvById()
          this.getEditWarehouseById()
          this.current_existencias = this.new_producto.existencias || 0
          this.current_inv.min = this.new_producto.inventario_min || 0
          this.current_inv.max = this.new_producto.inventario_max || 0
        }
        this.viewLoading = false
      })
  }

  addProduct(ref: any){
    if(this.validUnit()===true && this.validWarehouse()===true && this.validProvider()===true){
      this.new_producto = this.getQuantityByFactor(this.new_producto)
      this.new_producto = this.setInventoryMinMax(this.new_producto)
      console.log(this.new_producto);
      this.productsService.addProduct(this.new_producto, this.categoria)
        .subscribe(resp =>{
          if (resp.ok === true){
            this.getProducts(this.categoria)
            ref.close()
            this.cargarProductImg(resp.producto._id)
            this.toastMixin.fire({
              title: 'Producto agregado'
            });
            this.resetProduct()
          }else{
            Swal.fire('Error', resp, 'error')
          }
          this.addLoading = false
        })
      }
}

  updateProduct(id: string, ref: any){
    if(this.validUnit()===true && this.validWarehouse()===true && this.validProvider()===true){
      this.product = this.getQuantityByFactor(this.new_producto)
      this.product = this.setInventoryMinMax(this.product)
      console.log(this.product);
      this.updLoading = true
      this.productsService.updateProduct(id, this.product, this.categoria).subscribe(resp => {
        if(resp.ok === true){
          if (this.changeImg === true){
            this.cargarProductImg(id)
          }
          this.toastMixin.fire({
            title: 'Producto actualizado'
          });
          this.getProducts(this.categoria)
          ref.close()
          this.resetProduct()
        }else{
          Swal.fire('Error', resp, 'error')
        }
        this.updLoading = false
      })
    }
  }

  deleteProduct(id: string|undefined){
    Swal.fire({
      title: '¿Estás seguro de eliminarlo?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      cancelButtonText: 'Cancelar',
      confirmButtonText: 'Confirmar',
    }).then((result) => {
      this.delLoading = true
      if (result.isConfirmed) {
        if (id !== undefined)
          this.productsService.deleteProduct(id).subscribe(resp => {
              if (resp.ok === true){
                this.getProducts(this.categoria)
                this.addUnit=false
                this.toastMixin.fire({
                  title: 'Producto eliminado'
                });
              }else{
                Swal.fire('Error', resp, 'error')
                console.log(resp)
              }
              this.delLoading = false
            })
        }else{

          this.delLoading = false
        }
    })
    
  }

  getCategory(id: string){
    this.categoriasService.getCategory(id).subscribe(resp =>{
      if(resp.ok === true){
        this.title = resp.categoria.nombre
        this.current_category = resp.categoria.nombre
      }
    })
  }

  cargarProductImg(id:string) {
    if(this.files.length > 0){
    this.uploadsService.cargarImg(this.files, 'productos', id).subscribe(resp =>{
      if(resp.ok === true){
        console.log(resp.modelo.img)
      }else{
        Swal.fire('Error', resp, 'error')
      }
    })
  }
  }

  onProductRowSelect(event:any): void {
    this.product_selected = true
    this.product = event.data
    if(this.product.img){
      this.productSrc = this.uploadsUrl + '/' + this.product._id
    }
    this.getProdByUnitId()
    this.getProviderById()
    this.getWarehouseById()
    this.current_existencias = this.product.existencias || 0
    this.current_inv.min = this.product.inventario_min || 0
    this.current_inv.max = this.product.inventario_max || 0
  }

  get addProductFormControls(): any {
    return this.addProductForm['controls'];
  }

  openDialog(dialog: TemplateRef<any>, closeOnBackdropClick: boolean) {
    this.dialogService.open(dialog, { closeOnBackdropClick });
    this.getUnits()
    this.getProviders()
    this.getWarehouses()
    this.section_general = true
    if(this.modalEdit===false){
      this.prepareNewProduct()
    }
  }

  prepareNewProduct(){
    this.unit_value = {compra: '', venta: '', compra_abv:'', venta_abv: ''}
    this.provider_value = ''
    this.warehouse_value = ''
    this.current_existencias = 0
    this.new_producto.factor = 1
    this.current_unit_gen = this.unit_value.venta_abv
    this.current_unit_inv = this.unit_value.venta_abv
    this.current_inv = {min:0,max:0}
  }

  changeDialogSection(event:string){
    switch (event) {
      case 'general':
        this.section_general = true; this.section_personalizar = false; this.section_adicional = false; this.changeImg = false;
        break;
      case 'adicional':
        this.section_general = false; this.section_personalizar = false; this.section_adicional = true; this.changeImg = false;
        break;
      case 'personalizar':
        this.section_general = false; this.section_personalizar = true; this.section_adicional = false;
        break;
    
      default:
        break;
    }
    this.getProviders()
  }

  openDialogInfo(dialog: TemplateRef<any>, closeOnBackdropClick: boolean) {
    this.dialogService.open(dialog, { closeOnBackdropClick });
  }
  resetProduct(){
    let tmp_categoria = this.current_category
    this.new_producto = {};
    this.current_category = tmp_categoria
    this.changeDialogSection('general');
  }

  files: File[] = [];

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
  trees:Array<any> = []
  onTagRemove(tagToRemove: NbTagComponent): void {
    this.trees = this.trees.filter(t => t !== tagToRemove.text);
  }

  onTagAdd(event:any): void {
    if (event) {
      if(event.target.value.trim() != '')
        this.trees.push(event.target.value)
    }
    // input.nativeElement.value = '';
  }

  tagsStock(row:any){
    if (row.inventario_min < row.existencias) { 
      if(row.inventario_max <= row.existencias){
        return `<span class="badge-stock status-fullstock">STOCK LLENO</span>`;
      }
      return `<span class="badge-stock status-instock">HAY EN STOCK</span>`; 
    }
    else if(row.existencias <= 0) {return `<span class="badge-stock status-outstock">NO HAY STOCK</span>`;
    }else if(row.inventario_min >= row.existencias){
      return `<span class="badge-stock status-lowstock">STOCK BAJO</span>`;
    }
    else{
      return `<span>No data</span>`
    }
  }

  settings = {
    actions: {
      add: false,
      edit: false,
      delete: false,
      // custom: [{ name: 'ourCustomAction', title: '<i class="nb-compose"></i>' }],
      // position: 'right'
    },
    // rowClassFunction: ((row:any) =>{
    //   if(row.data.estado == 'Activo'){
    //     return 'solved';
    //   }else {
    //     return 'aborted'
    //   }
    // }),
    columns: {
      clave: {
        title: 'Clave',
        type: 'string',
        filter: false,
      },
      nombre:{
        title: 'Nombre',
        type: 'boolean',
        filter: false,
      },
      existencias: {
        title: 'Existencias',
        type: 'number',
        filter: false,
      },
      precio_venta: {
        title: 'Precio Venta',
        type: 'number',
        filter: false,
      },
      estado: {
        title: 'Estado',
        filter: false,
        type: 'html',
        valuePrepareFunction: ((data:any, row:any) => {return this.tagsStock(row)}),
      }
    },
    pager: {
      display: true,
      perPage: 15,
    }
  };


  onSearch(query: string = '') {
    if(query == ''){
      this.source.setFilter([]);
    }else{
    this.source.setFilter([
      // fields we want to include in the search
      {
        field: 'clave',
        search: query
      },
      {
        field: 'nombre',
        search: query
      }
    ], false); 
  }
  }

  getQuantityByFactor(producto:ProductosBody){
    if(this.unit_value.compra_abv === this.current_unit_gen){
      if(!producto.factor) producto.factor = 1
      producto.existencias = producto.factor * this.current_existencias
    }else{
      producto.existencias = this.current_existencias
    }
    return producto
  }

  setInventoryMinMax(producto:ProductosBody){
    if(this.current_unit_inv === this.unit_value.compra_abv){
      if(!producto.factor) producto.factor = 1
      producto.inventario_min = producto.factor * this.current_inv.min
      producto.inventario_max = producto.factor * this.current_inv.max
    }else{
      producto.inventario_min = this.current_inv.min
      producto.inventario_max = this.current_inv.max
    }
    return producto
  }

  getUserRol(){
    this.usersService.validateJWT().subscribe(res=>{
      if(res.ok && res.ok ===true){
        this.user_rol = res.usuario.rol
      }
    })
  }

// +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++ //

  // ? Functions units and providers and warehouses

  getUnits(){
    this.unitsService.getUnidades().subscribe(res =>{
      const {unidades} = res
      this.products_units = unidades
      this.products_units.forEach(unit => {
        if (!this.options_units.includes(unit.nombre.toLowerCase())){
          this.options_units.push(unit.nombre.toLowerCase());
        }
      });
      this.filteredCompraOptions$ = of(this.options_units);
      this.filteredVentaOptions$ = of(this.options_units);
    })
  }

  getProviders(){
    this.providerService.getProveedores().subscribe(res =>{
      const {proveedores} = res
      this.products_providers = proveedores
      this.products_providers.forEach(prov => {
        if (!this.options_providers.includes(prov.nombre_empresa.toLowerCase())){
          this.options_providers.push(prov.nombre_empresa.toLowerCase());
        }
      });
      this.filteredProviderOptions$ = of(this.options_providers);
    })
  }

  getWarehouses(){
    this.warehouseService.getAlmacenes().subscribe(res =>{
      const {almacenes} = res
      this.products_warehouses = almacenes
      this.products_warehouses.forEach(warehouse => {
        if (!this.options_warehouses.includes(warehouse.nombre.toLowerCase())){
          this.options_warehouses.push(warehouse.nombre.toLowerCase());
        }
      });
      this.filteredWarehouseOptions$ = of(this.options_warehouses);
    })
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

  onChange(field:string) {
    switch (field) {
      case 'compra':
        this.filteredCompraOptions$ = this.getFilteredOptions(this.unitCompraInput.nativeElement.value, this.options_units);
        break;
      case 'venta':
        this.filteredVentaOptions$ = this.getFilteredOptions(this.unitVentaInput.nativeElement.value, this.options_units);
        break;
      case 'prov':
        this.filteredProviderOptions$ = this.getFilteredOptions(this.providerInput.nativeElement.value, this.options_providers);
        break;
      case 'almacen':
        this.filteredWarehouseOptions$ = this.getFilteredOptions(this.warehouseInput.nativeElement.value, this.options_warehouses);
        break;
    
      default:
        break;
    }
    
  }

  onCompraSelectionChange($event:any) {
    this.filteredCompraOptions$ = this.getFilteredOptions($event, this.options_units);
    this.unit_value.compra = $event
    let unit = this.filterUnitNameCompra()
    if(unit.length > 0 && unit[0].abreviacion)
      this.unit_value.compra_abv = unit[0].abreviacion
     
  }
  onVentaSelectionChange($event:any) {
    this.filteredVentaOptions$ = this.getFilteredOptions($event, this.options_units);
    this.unit_value.venta = $event
    let unit = this.filterUnitVenta()
    if(unit.length > 0 && unit[0].abreviacion){
      this.unit_value.venta_abv = unit[0].abreviacion
      this.current_unit_gen = this.unit_value.venta_abv
      this.current_unit_inv = this.unit_value.venta_abv
    }
  }
  
  onProvSelectionChange($event:any) {
    this.filteredProviderOptions$ = this.getFilteredOptions($event, this.options_providers);
    this.provider_value = $event
  }

  onAlmacenSelectionChange($event:any) {
    this.filteredWarehouseOptions$ = this.getFilteredOptions($event, this.options_warehouses);
    this.warehouse_value = $event
  }

  filterUnitNameCompra(){
    return this.products_units.filter(unit => unit.nombre.toLowerCase() === this.unit_value.compra.toLowerCase())
  }
  filterUnitVenta(){
    return this.products_units.filter(unit => unit.nombre.toLowerCase() === this.unit_value.venta.toLowerCase())
  }

  validUnit(){
    if (this.unit_value.compra){
      this.unit_compra_id = this.filterUnitNameCompra()
      if(this.unit_compra_id.length <= 0){
        this.openDialogInfo(this.AddUnit,false);
        this.unit_exists = this.unit_value.compra
        return false
      }else{
        this.new_producto.unidad_compra = this.unit_compra_id[0]._id
      }
    }
    if(this.unit_value.venta){
      this.unit_venta_id = this.filterUnitVenta()
      if(this.unit_venta_id.length <= 0){
        this.openDialogInfo(this.AddUnit,false);
        this.unit_exists = this.unit_value.venta
        return false
      }else{
        this.new_producto.unidad_venta = this.unit_venta_id[0]._id
      }
    }
    return true
  }

  changeUnit(){
    if(this.current_unit_gen === this.unit_value.venta_abv){
      this.current_unit_gen = this.unit_value.compra_abv
    }else{
      this.current_unit_gen = this.unit_value.venta_abv
    }
  }

  changeInvUnit(){
    if(this.current_unit_inv === this.unit_value.venta_abv){
      this.current_unit_inv = this.unit_value.compra_abv
    }else{
      this.current_unit_inv = this.unit_value.venta_abv
    }
  }


  getUnitEditById(){
    if (this.new_producto.unidad_compra){
      this.unitsService.getUnidad(this.new_producto.unidad_compra)
      .subscribe(resp=>{
        if (resp.ok === true){
          this.unit_value.compra = resp.unidad.nombre.toLowerCase()
          this.unit_value.compra_abv = resp.unidad.abreviacion.toLowerCase()
        }
      })
    }
    if (this.new_producto.unidad_venta){
      this.unitsService.getUnidad(this.new_producto.unidad_venta)
      .subscribe(resp=>{
        if (resp.ok === true){
          this.unit_value.venta = resp.unidad.nombre.toLowerCase()
          this.unit_value.venta_abv = resp.unidad.abreviacion.toLowerCase()
          this.current_unit_gen = this.unit_value.venta_abv
          this.current_unit_inv = this.unit_value.venta_abv
        }
      })
    }
  }

  getProdByUnitId(){
    if (this.product.unidad_compra){
      this.unitsService.getUnidad(this.product.unidad_compra)
      .subscribe(resp=>{
        if (resp.ok === true){
          // this.product.unidad_compra = resp.unidad.nombre.toLowerCase()
          this.unit_value.compra = resp.unidad.nombre.toLowerCase()
          this.unit_value.compra_abv = resp.unidad.abreviacion.toLowerCase()
        }
      })
    }
    if (this.product.unidad_venta){
      this.unitsService.getUnidad(this.product.unidad_venta)
      .subscribe(resp=>{
        if (resp.ok === true){
          // this.product.unidad_venta = resp.unidad.nombre.toLowerCase()
          this.unit_value.venta = resp.unidad.nombre.toLowerCase()
          this.unit_value.venta_abv = resp.unidad.abreviacion.toLowerCase()
          this.current_unit_gen = this.unit_value.venta_abv
          this.current_unit_inv = this.unit_value.venta_abv
        }
      })
    }
  }

  addUnitFnc(ref:any){
    this.unitsService.addUnidad(this.new_unit)
    .subscribe(resp =>{
      if(resp.ok === true){
        this.new_unit = {}
        ref.close()
        this.addUnit = false
        this.getUnits()
      }else{
        Swal.fire('Error', resp.msg, 'error')
        // this.addUnit = false
      }
    })
  }

  getProviderById(){
    if (this.product.proveedor){
      this.providerService.getProveedor(this.product.proveedor)
      .subscribe(resp=>{
        if (resp.ok === true){
          this.provider_value = resp.proveedor.nombre_empresa.toLowerCase()
        }
      })
    }else{
      this.provider_value = ''
    }
  }

  getEditProvById(){
    if (this.new_producto.proveedor){
      this.providerService.getProveedor(this.new_producto.proveedor)
      .subscribe(resp=>{
        if (resp.ok === true){
          this.provider_value = resp.proveedor.nombre_empresa.toLowerCase()
        }
      })
    }else{
      this.provider_value = ''
    }
  }

  getWarehouseById(){
    if (this.product.almacen){
      this.warehouseService.getAlmacen(this.product.almacen)
      .subscribe(resp=>{
        if (resp.ok === true){
          this.warehouse_value = resp.almacen.nombre.toLowerCase()
        }
      })
    }else{
      this.warehouse_value = ''
    }
  }

  getEditWarehouseById(){
    if (this.new_producto.almacen){
      this.warehouseService.getAlmacen(this.new_producto.almacen)
      .subscribe(resp=>{
        if (resp.ok === true){
          this.warehouse_value = resp.almacen.nombre.toLowerCase()
        }
      })
    }else{
      this.warehouse_value = ''
    }
  }

  validProvider(){
    if(!this.provider_value) 
      return true
    let providers = this.products_providers.filter(prov => prov.nombre_empresa.toLowerCase() === this.provider_value.toLowerCase())
    if(providers.length <= 0){
      Swal.fire(`El proveedor ${this.provider_value} no existe`, 'Por favor, agreguelo primero en la sección de proveedores', 'error')
      return false
    }else{
      this.new_producto.proveedor = providers[0]._id
      return true
    }
  }

  validWarehouse(){
    if(!this.warehouse_value) 
      return true
    let warehouses = this.products_warehouses.filter(almacen => almacen.nombre.toLowerCase() === this.warehouse_value.toLowerCase())
    if(warehouses.length <= 0){
      Swal.fire(`El almacen ${this.warehouse_value} no existe`, 'Por favor, agregalo primero en la sección de almacenes', 'error')
      return false
    }else{
      this.new_producto.almacen = warehouses[0]._id
      return true
    }
  }
  
}



