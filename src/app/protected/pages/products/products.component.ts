import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { LocalDataSource } from 'ng2-smart-table';
import Swal from 'sweetalert2';
import { ProductsService } from '../../services/products.service';
import { CategoriasService } from '../../services/categorias.service';
import { ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NbDialogService } from '@nebular/theme';

@Component({
  selector: 'app-products',
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.scss']
})
export class ProductsComponent implements OnInit{

  // categorias: Array<string> = []
  toastMixin: any;
  productos: any;
  source: LocalDataSource;
  params: any;
  modalEdit: boolean = false
  modalLoading: boolean = false
  viewLoading: boolean = false
  addLoading: boolean = false
  updLoading: boolean = false
  delLoading: boolean = false
  title:string = ''
  selectedCategory:string =  ''
  changesEdit = true
  @ViewChild('Producto') Producto!: TemplateRef<any>;

  // @ViewChild('Usuario') Usuario!: TemplateRef<any>; 
  constructor(private productsService: ProductsService,
              private categoriasService: CategoriasService,
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
  }

  getProducts(id: string){
    
    this.viewLoading = true
    this.productsService.getProductsByCategoria(id).subscribe(res =>{
      const {productos} = res
      this.productos = productos
      this.source.load(productos)
      this.viewLoading = false
    })
  }

  addProduct(ref: any){
    this.productsService.addProduct(this.productos)
      .subscribe(resp =>{
        if (resp.ok === true){
          // this.getProducts()
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
    this.updLoading = true
    this.productsService.updateProduct(id, this.productos).subscribe(resp => {
      if(resp.ok === true){
        console.log(resp);
        this.toastMixin.fire({
          title: 'Producto actualizado'
        });
        // this.getProducts()
        ref.close()
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
              // this.getProducts()
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
      }
    })
  }

  onUserRowSelect(event:any): void {
    this.modalEdit = true;
    console.log(event);
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
  }

  cancelDialog(){
    this.addProductForm.reset()
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
      nombre: {
        title: 'Nombre',
        type: 'string',
        filter: false,
      },
      descripcion:{
        title: 'Descripción',
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
      {
        field: 'descripcion',
        search: query
      },
    ], false); 
  }
  }

}
