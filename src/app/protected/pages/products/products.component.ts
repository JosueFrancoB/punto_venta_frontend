import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { LocalDataSource } from 'ng2-smart-table';
import Swal from 'sweetalert2';
import { ProductsService } from '../../services/products.service';
import { CategoriasService } from '../../services/categorias.service';
import { ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NbDialogService, NbTagComponent, NbTagInputAddEvent } from '@nebular/theme';
import { ProductosBody } from '../../interfaces/protected-interfaces';
import { UnitsService } from '../../services/units.service';

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
  changesEdit = true
  product_selected = false
  product_edit = ''
  products_units: Array<any> = []
  section_general:boolean = true

  @ViewChild('Producto') Producto!: TemplateRef<any>;

  // @ViewChild('Usuario') Usuario!: TemplateRef<any>; 
  constructor(private productsService: ProductsService,
              private categoriasService: CategoriasService,
              private unitsService: UnitsService,
              private dialogService: NbDialogService,
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
    })
  }

  getClickedProduct(id: string|undefined){
    
    this.viewLoading = true
    if (id !== undefined)
      this.productsService.getProduct(id).subscribe(resp =>{
        if (resp.ok === true){
          console.log(resp);
          this.modalEdit = true
          this.new_producto = resp.producto
          if (this.new_producto.categoria)
            this.new_producto.categoria = resp.producto.categoria.nombre
        }
        this.viewLoading = false
      })
  }

  addProduct(ref: any){
    this.productsService.addProduct(this.new_producto, this.categoria)
      .subscribe(resp =>{
        if (resp.ok === true){
          this.getProducts(this.categoria)
          ref.close()
          this.toastMixin.fire({
            title: 'Producto agregado'
          });
        }else{
          Swal.fire('Error', resp, 'error')
        }
        this.addLoading = false
      })
}

  updateProduct(id: string, ref: any){
    this.product = this.new_producto
    this.updLoading = true
    this.productsService.updateProduct(id, this.product, this.categoria).subscribe(resp => {
      if(resp.ok === true){
        console.log(resp);
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

  deleteProduct(id: string, ref: any){
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
        this.productsService.deleteProduct(id).subscribe(resp => {
            if (resp.ok === true){
              this.getProducts(this.categoria)
              ref.close()
              this.toastMixin.fire({
                title: 'Producto eliminado'
              });
            }else{
              Swal.fire('Error', resp, 'error')
              console.log(resp)
            }
            this.delLoading = false
          },
          )
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

  onUserRowSelect(event:any): void {
    console.log(event);
    this.product_selected = true
    this.product = event.data
    // this.modalEdit = true;
    // this.changesEdit = false;
    // let {rol} = event.data
    // delete event.data.password
    // this.user_rol = rol
    // this.selectedRol = rol
    // this.user_id = event.data.uid
    // this.modalLoading = true
    // this.usersService.getUser(this.user_id).subscribe(resp => {
    //   if (resp.ok === true){
    //     this.user = resp.usuario
    //     this.checkedEstado = this.user.estado
    //   }
    //   this.modalLoading = false
    // })
    
  }

  get addProductFormControls(): any {
    return this.addProductForm['controls'];
  }

  openDialog(dialog: TemplateRef<any>, closeOnBackdropClick: boolean) {
    this.dialogService.open(dialog, { closeOnBackdropClick });
    // this.dialogRef = this.dialogService.open(dialog, { closeOnBackdropClick });
    this.unitsService.getUnidades().subscribe(res =>{
      console.log(res);
      const {unidades} = res
      this.products_units = unidades
    })
    this.section_general = true
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

  onTagAdd({ value, input }: NbTagInputAddEvent): void {
    if (value) {
      this.trees.push(value)
    }
    input.nativeElement.value = '';
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

}
