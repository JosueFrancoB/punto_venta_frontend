import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { CategoriasService } from '../../services/categorias.service';
import Swal from 'sweetalert2'
import { Observable, of, map } from 'rxjs';
import { NbDialogService } from '@nebular/theme';
@Component({
  selector: 'app-categorias',
  templateUrl: './categorias.component.html',
  styleUrls: ['./categorias.component.scss'],
})
export class CategoriasComponent implements OnInit {

  categorias: Array<string> = []
  filteredOptions$!: Observable<string[]>;
  @ViewChild('autoInput') input:any;
  @ViewChild('category') category!: TemplateRef<any>;


  constructor(private categoriasService: CategoriasService,
              private dialogService: NbDialogService) { }

  ngOnInit() {
    this.categoriasService.getCategories().subscribe(res =>{
      const {categorias} = res
      console.log(categorias);
      categorias.forEach(categoria => {
        this.categorias.push(categoria.nombre)
      });
    })
    this.filteredOptions$ = of(this.categorias);
  }

  private filter(value: string): string[] {
    const filterValue = value.toLowerCase();
    return this.categorias.filter(optionValue => optionValue.toLowerCase().includes(filterValue));
  }

  getFilteredOptions(value: string): Observable<string[]> {
    return of(value).pipe(
      map(filterString => this.filter(filterString)),
    );
  }

  onChange() {
    this.filteredOptions$ = this.getFilteredOptions(this.input.nativeElement.value);
  }

  onSelectionChange($event: any) {
    this.filteredOptions$ = this.getFilteredOptions($event);
    console.log($event);
  }

  openDialog(dialog: TemplateRef<any>, closeOnBackdropClick: boolean) {
    // this.checkedEstado = true
    this.dialogService.open(dialog, { closeOnBackdropClick });
    // this.dialogRef = this.dialogService.open(dialog, { closeOnBackdropClick });
  }

  cancelDialog(){
    // this.addUserForm.reset()
  }

  // deleteCategoria(id: string, ref: any){
  //   Swal.fire({
  //     title: '¿Estás seguro de eliminarlo?',
  //     icon: 'warning',
  //     showCancelButton: true,
  //     confirmButtonColor: '#3085d6',
  //     cancelButtonColor: '#d33',
  //     confirmButtonText: 'Confirmar'
  //   }).then((result) => {
  //     this.delLoading = true
  //     if (result.isConfirmed) {
  //       this.usersService.deleteUser(id).subscribe(resp => {
  //           if (resp.ok === true){
  //             this.getUsers()
  //             ref.close()
  //             this.toastMixin.fire({
  //               title: 'Usuario eliminado'
  //             });
  //           }else{
  //             Swal.fire('Error', resp, 'error')
  //             console.log(resp)
  //           }
  //           this.delLoading = false
  //         },
  //       )
        
  //     }
  //   })
    
}
