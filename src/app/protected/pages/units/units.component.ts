import Swal from 'sweetalert2';
import { Observable } from 'rxjs';
import { NbDialogService } from '@nebular/theme';
import { UnitsService } from '../../services/units.service';
import { UnitsBody } from '../../interfaces/protected-interfaces';
import { environment } from 'src/environments/environment';
import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';

@Component({
  selector: 'app-units',
  templateUrl: './units.component.html',
  styleUrls: ['./units.component.scss']
})
export class UnitsComponent implements OnInit {


  unidades: Array<UnitsBody> = []
  filteredOptions$!: Observable<string[]>;
  @ViewChild('autoInput') input:any;
  @ViewChild('unit') unit!: TemplateRef<any>;
  toastMixin: any
  cardMouseOver: Array<any> = []
  modalEdit = false
  unitValue = ''
  unit_edit = ''
  searchText = ''
  new_unit:UnitsBody = {}
  changesEdit = true

  viewLoading = false
  modalLoading = false;
  addLoading = false;
  updLoading = false;

  uploadsUrl:string = environment.baseUrl + '/uploads/proveedores'

  constructor(private unitsService: UnitsService,
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
    this.getUnits()
  }

  getUnits(){
    this.viewLoading = true
    this.unitsService.getUnidades().subscribe(res =>{
      console.log(res);
      const {unidades} = res
      this.unidades = unidades
      this.viewLoading = false
    })
    }

  addUnit(ref: any){
    console.log(this.new_unit);
    this.unitsService.addUnidad(this.new_unit)
    .subscribe(resp =>{
      if(resp.ok === true){
        console.log(resp)
        this.getUnits()
        ref.close()
        this.toastMixin.fire({
          title: 'Unidad agregada'
        });
        this.resetUnit()
      }else{
        Swal.fire('Error', resp, 'error')
      }
    })
  }


  updateUnit(unit:UnitsBody, ref: any){
    let id = unit._id ? unit._id : ''

    this.unitsService.updateUnidad(id, unit).subscribe(resp =>{
      if(resp.ok === true){
        let nombre = resp.unidad.nombre
        let _id = resp.unidad._id
        let index = 0
        this.unidades.forEach(function(cli, i){
          if(cli._id === id){
            index = i
          }
        })
        this.unidades = this.unidades.filter(item => item._id !== id)
        this.unidades.splice(index, 0, {_id, nombre});
        ref.close()
        this.getUnits()
        this.toastMixin.fire({
          title: 'Unidad actualizada'
        });
        this.resetUnit()
      }else{
        Swal.fire('Error', resp.msg, 'error')
      }
    })
  }

  getUnit(id:string){
    this.modalEdit = true;
    this.unitsService.getUnidad(id).subscribe(resp => {
      if (resp.ok === true){
        this.new_unit = resp.unidad
      }else{
      console.log('error', resp)
      Swal.fire('Error', resp, 'error')
      }
    })
  }

  deleteUnit(id:string){
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
        this.unitsService.deleteUnidad(id).subscribe(resp =>{
        if(resp.ok === true){
          this.unidades = this.unidades.filter(item => item._id !== id)
          this.getUnits()
          this.toastMixin.fire({
            title: 'Unidad eliminada'
          });
        }else{
          Swal.fire('Error', resp, 'error')
        }
      })
    }
  })
  }

  openDialog(dialog: TemplateRef<any>, closeOnBackdropClick: boolean) {
    this.dialogService.open(dialog, { closeOnBackdropClick });
  }

  resetUnit(){
    this.new_unit = {}
  }

  cancelDialog(){
    this.resetUnit()
  }

  mouseEnter(data: any) {
    this.cardMouseOver.push(data.target.title)
  }

  mouseLeave(data: any) {
    let value = (data.target.title)
    this.cardMouseOver = this.cardMouseOver.filter(item => item !== value)
  }

  isDisplay(unit: string): boolean{
    return this.cardMouseOver.includes(unit) ? true : false
  }
}
