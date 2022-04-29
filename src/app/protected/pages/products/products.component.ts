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
  section_general:boolean = true
  section_adicional:boolean = false
  section_personalizar:boolean = false
  uploadsUrl:string = environment.baseUrl + '/uploads/productos'
  new_unit:UnitsBody = {}
  addUnit:boolean = false
  unit_exists:string = '' 
  new_provider: ProveedoresBody = {}

  @ViewChild('Producto') Producto!: TemplateRef<any>;
  @ViewChild('AddUnit') AddUnit!: TemplateRef<any>;

  options_units: string[] = [];
  options_providers: string[] = [];
  filteredCompraOptions$!: Observable<string[]>;
  filteredVentaOptions$!: Observable<string[]>;
  filteredProviderOptions$!: Observable<string[]>;
  @ViewChild('unitCompraInput') unitCompraInput: any;
  @ViewChild('unitVentaInput') unitVentaInput: any;
  @ViewChild('providerInput') providerInput: any;

  constructor(private productsService: ProductsService,
              private categoriasService: CategoriasService,
              private unitsService: UnitsService,
              private providerService: ProveedoresService,
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
    this.settings.pager.perPage = 5;
    
  }

  getProducts(id: string){
    this.categoria = id
    this.viewLoading = true
    this.productsService.getProductsByCategoria(id).subscribe(res =>{
      const {productos} = res
      this.productos = productos
      this.source.load(productos)
      this.viewLoading = false
      this.getProdUnitId()
    })
  }

  getClickedProduct(id: string|undefined){
    
    this.viewLoading = true
    if (id !== undefined)
      this.productsService.getProduct(id).subscribe(resp =>{
        if (resp.ok === true){
          this.productSrc = this.uploadsUrl + '/' + resp.producto._id
          this.modalEdit = true
          this.new_producto = resp.producto
          if (this.new_producto.categoria){
            this.new_producto.categoria = resp.producto.categoria.nombre
          }
          this.getUnitID()
        }
        this.viewLoading = false
      })
  }

  addProduct(ref: any){
    console.log(this.new_producto);
    if(this.validUnit()===true){
      this.productsService.addProduct(this.new_producto, this.categoria)
        .subscribe(resp =>{
          if (resp.ok === true){
            this.getProducts(this.categoria)
            ref.close()
            this.cargarProductImg(resp.producto._id)
            this.toastMixin.fire({
              title: 'Producto agregado'
            });
          }else{
            Swal.fire('Error', resp, 'error')
          }
          this.addLoading = false
        })
      }
}

  updateProduct(id: string, ref: any){
    console.log(this.new_producto);
    if(this.validUnit()===true){
      this.product = this.new_producto
      this.updLoading = true
      this.productsService.updateProduct(id, this.product, this.categoria).subscribe(resp => {
        if(resp.ok === true){
          console.log(resp);
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
      console.log(resp);
      if(resp.ok === true){
        this.title = resp.categoria.nombre
        this.new_producto.categoria = resp.categoria.nombre
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
    this.getProdUnitId()
    this.getProviderId()
  }

  get addProductFormControls(): any {
    return this.addProductForm['controls'];
  }

  openDialog(dialog: TemplateRef<any>, closeOnBackdropClick: boolean) {
    this.dialogService.open(dialog, { closeOnBackdropClick });
    this.getUnits()
    this.section_general = true
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
      this.filteredCompraOptions$ = of(this.options_units);
      this.filteredVentaOptions$ = of(this.options_units);
    })
  }

  openDialogInfo(dialog: TemplateRef<any>, closeOnBackdropClick: boolean) {
    this.dialogService.open(dialog, { closeOnBackdropClick });
  }
  resetProduct(){
    let tmp_categoria = this.new_producto['categoria']
    this.new_producto = {};
    this.new_producto.categoria = tmp_categoria
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
      disponible: {
        title: 'Estado',
        filter: false,
        type: 'html',
        valuePrepareFunction: ((data:any, row:any) => { if (data === true) { return `<span class="badge-stock status-instock">HAY EN STOCK</span>`; } else {return `<span class="badge-stock status-outstock">NO HAY STOCK</span>`;}}),
      },
    },
    pager: {
      display: true,
      perPage: 5,
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
      },
    ], false); 
  }
  }

// +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++ //

  // ? Functions units and providers
  
  private filter(value: string): string[] {
    if (value){
      let filterValue = value.toLowerCase();
      return this.options_units.filter(optionValue => optionValue.toLowerCase().includes(filterValue));
    }
    return []
  }

  getFilteredOptions(value: string): Observable<string[]> {
    return of(value).pipe(
      map(filterString => this.filter(filterString)),
    );
  }

  onChangeCompra() {
    this.filteredCompraOptions$ = this.getFilteredOptions(this.unitCompraInput.nativeElement.value);
  }

  onChangeVenta() {
    this.filteredVentaOptions$ = this.getFilteredOptions(this.unitVentaInput.nativeElement.value);
  }

  onCompraSelectionChange($event:any) {
    this.filteredCompraOptions$ = this.getFilteredOptions($event);
    this.new_producto.unidad_compra = $event
  }
  onVentaSelectionChange($event:any) {
    this.filteredVentaOptions$ = this.getFilteredOptions($event);
    this.new_producto.unidad_venta = $event
  }

  validUnit(){
    if (this.new_producto.unidad_compra){
      let unit_compra = this.products_units.filter(unit => unit.nombre.toLowerCase() === this.new_producto.unidad_compra!.toLowerCase())
      if(unit_compra.length <= 0){
        this.openDialogInfo(this.AddUnit,false);
        this.unit_exists = this.new_producto.unidad_compra
        return false
      }else{
        this.new_producto.unidad_compra = unit_compra[0]._id
      }
    }
    if(this.new_producto.unidad_venta){
      let unit_venta = this.products_units.filter(unit => unit.nombre.toLowerCase() === this.new_producto.unidad_venta!.toLowerCase())
      if(unit_venta.length <= 0){
        this.openDialogInfo(this.AddUnit,false);
        this.unit_exists = this.new_producto.unidad_venta
        return false
      }else{
        this.new_producto.unidad_venta = unit_venta[0]._id
      }
    }
    return true
  }

  getUnitID(){
    if (this.new_producto.unidad_compra){
      this.unitsService.getUnidad(this.new_producto.unidad_compra)
      .subscribe(resp=>{
        if (resp.ok === true){
          this.new_producto.unidad_compra = resp.unidad.nombre.toLowerCase()
        }
      })
    }
    if (this.new_producto.unidad_venta){
      this.unitsService.getUnidad(this.new_producto.unidad_venta)
      .subscribe(resp=>{
        if (resp.ok === true){
          this.new_producto.unidad_venta = resp.unidad.nombre.toLowerCase()
        }
      })
    }
  }

  getProdUnitId(){
    if (this.product.unidad_compra){
      this.unitsService.getUnidad(this.product.unidad_compra)
      .subscribe(resp=>{
        if (resp.ok === true){
          this.product.unidad_compra = resp.unidad.nombre.toLowerCase()
        }
      })
    }
    if (this.product.unidad_venta){
      this.unitsService.getUnidad(this.product.unidad_venta)
      .subscribe(resp=>{
        if (resp.ok === true){
          this.product.unidad_venta = resp.unidad.nombre.toLowerCase()
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

  validProvider(){
    if (this.new_producto.proveedor){
      let proveedores = this.products_providers.filter(prov => prov.nombre_empresa.toLowerCase() === this.new_producto.proveedor!.toLowerCase())
      if(proveedores.length <= 0){
        this.openDialogInfo(this.AddUnit,false);
        this.unit_exists = this.new_producto.proveedor
        return false
      }else{
        this.new_producto.proveedor = proveedores[0]._id
      }
    }
    return true
  }

  getProviderId(){
    if (this.new_producto.proveedor){
      this.providerService.getProveedor(this.new_producto.proveedor)
      .subscribe(resp=>{
        if (resp.ok === true){
          this.new_producto.proveedor = resp.proveedor.nombre_empresa.toLowerCase()
        }
      })
    }
  }

}



