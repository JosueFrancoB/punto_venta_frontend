import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { CategoriasService } from '../../services/categorias.service';
import Swal from 'sweetalert2'
import { Observable, of, map } from 'rxjs';
import { NbDialogService } from '@nebular/theme';
import { UploadsService } from '../../services/uploads.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-categorias',
  templateUrl: './categorias.component.html',
  styleUrls: ['./categorias.component.scss'],
})
export class CategoriasComponent implements OnInit {

  categorias: Array<any> = []
  files: File[] = [];
  filteredOptions$!: Observable<string[]>;
  @ViewChild('autoInput') input:any;
  @ViewChild('category') category!: TemplateRef<any>;
  toastMixin: any
  categoryID:string = ''
  cardMouseOver: Array<any> = []
  modalEdit = false
  categoryValue = ''
  categorySrc = ''
  changeImg = true
  searchText = ''

  viewLoading = false
  modalLoading = false;
  addLoading = false;
  updLoading = false;

  uploadsUrl:string = environment.baseUrl + '/uploads/categorias'
  pageOfItems!: Array<any>;

  constructor(private categoriasService: CategoriasService,
              private uploadsService: UploadsService,
              private dialogService: NbDialogService) { 
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

  ngOnInit() {
    this.getCategories()
  }

  getCategories(){
    this.viewLoading = true
    this.categoriasService.getCategories().subscribe(res =>{
      const {categorias} = res
      this.categorias = categorias
      // categorias.forEach(categoria => {
      //   if (!this.categorias.some(cat => cat.nombre == categoria.nombre)){
      //     this.categorias.push(categoria)
      //   }
      // });
      this.viewLoading = false
    })
    }

  addCategory(category: string, ref: any){
    let data = {nombre: category}
    this.categoriasService.addCategory(data).subscribe(resp =>{
      if(resp.ok === true){
        console.log(resp)
        this.cargarCategoryImg(resp.categoria._id)
        this.getCategories()
        ref.close()
        this.toastMixin.fire({
          title: 'Categoria agregada'
        });
      }else{
        Swal.fire('Error', resp, 'error')
      }
    })
  }

  cargarCategoryImg(id:string) {
    if(this.files.length > 0){
    this.uploadsService.cargarImg(this.files, 'categorias', id).subscribe(resp =>{
      if(resp.ok === true){
        console.log(resp.modelo.img)
      }else{
        Swal.fire('Error', resp, 'error')
      }
    })
  }
  }

  updateCategory(category:string, ref: any){
    let id = this.categoryID
    this.categoriasService.updateCategory(id, category).subscribe(resp =>{
      if(resp.ok === true){
        if (this.changeImg === true){
        this.cargarCategoryImg(id)
        }
        let nombre = resp.categoria.nombre
        let _id = resp.categoria._id
        let img = resp.categoria.img
        let index = 0
        this.categorias.forEach(function(cat, i){
          if(cat._id === id){
            index = i
          }
        })
        this.categorias = this.categorias.filter(item => item._id !== id)
        this.categorias.splice(index, 0, {_id,nombre,img});
        ref.close()
        this.getCategories()
        this.toastMixin.fire({
          title: 'Categoria actualizada'
        });
      }else{
        Swal.fire('Error', resp, 'error')
      }
    })
  }

  getCategory(id:string){
    this.modalEdit = true;
    this.categoriasService.getCategory(id).subscribe(resp => {
      if (resp.ok === true){
        this.categoryValue = resp.categoria.nombre
        this.categoryID = resp.categoria._id
        this.categorySrc = this.uploadsUrl + '/' + resp.categoria._id
      }else{
      console.log('error', resp)
      Swal.fire('Error', resp, 'error')
      }
    })
  }

  deleteCategory(id:string){
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
        this.categoriasService.deleteCategory(id).subscribe(resp =>{
        if(resp.ok === true){
          this.categorias = this.categorias.filter(item => item._id !== id)
          this.getCategories()
          this.toastMixin.fire({
            title: 'Categoria eliminada'
          });
        }else{
          Swal.fire('Error', resp, 'error')
        }
      })
    }
  })
  }

  onChangePage(pageOfItems: Array<any>) {
    // update current page of items
    this.pageOfItems = pageOfItems;
  }

  openDialog(dialog: TemplateRef<any>, closeOnBackdropClick: boolean) {
    // this.checkedEstado = true
    this.onRemoveDrag(this.files[0]);
    this.dialogService.open(dialog, { closeOnBackdropClick });
    // this.dialogRef = this.dialogService.open(dialog, { closeOnBackdropClick });
  }

  cancelDialog(){
    // this.addUserForm.reset()
  }
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

  mouseEnter(data: any) {
    this.cardMouseOver.push(data.target.title)
  }

  mouseLeave(data: any) {
    let value = (data.target.title)
    this.cardMouseOver = this.cardMouseOver.filter(item => item !== value)
  }

  isDisplay(categoria: string): boolean{
    return this.cardMouseOver.includes(categoria) ? true : false
  }
  
}
