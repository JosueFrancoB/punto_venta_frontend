import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, map, of } from 'rxjs';
import { environment } from 'src/environments/environment';
import { WarehouseBody, WarehouseData } from '../interfaces/protected-interfaces';

@Injectable({
  providedIn: 'root'
})
export class WarehouseService {

  private baseUrl:string = environment.baseUrl
  constructor(private http:HttpClient) { }
  getToken(){
    return new HttpHeaders()
      .set('x-token', localStorage.getItem('x-token') || '')
  }

  getAlmacenes(){
    const headers = this.getToken()
    return this.http.get<WarehouseData>(`${this.baseUrl}/warehouses`, {headers})
      .pipe(
        map( resp => {
            return resp
        }),
        catchError(err => {
          if(err.error.errors){
            return of(err.error.errors[0].msg)
          }else{
            return of(err.error.msg)
          }
        })
      )
  }

  getAlmacen(id:string){
    const headers = this.getToken()
    return this.http.get(`${this.baseUrl}/warehouses/${id}`, {headers}).pipe(
      map( resp => {
        return resp
    }),
    catchError(err => {
      if(err.error.errors){
        return of(err.error.errors[0].msg)
      }else{
        return of(err.error.msg)
      }
    })
    )
  }

  addAlmacen(warehouse: any){
    const headers = this.getToken()
    console.log(warehouse);
    let body = warehouse
    return this.http.post(`${this.baseUrl}/warehouses`, body, {headers}).pipe(
      map( resp => {
        console.log(resp);
        return resp
    }),
    catchError(err => {
      if(err.error.errors){
        return of(err.error.errors[0].msg)
      }else{
        return of(err.error.msg)
      }
    })
    )
  }

  updateAlmacen(id:string, warehouse: WarehouseBody){
    const headers = this.getToken()
    let body = warehouse
    return this.http.patch(`${this.baseUrl}/warehouses/${id}`, body, {headers}).pipe(
      map( resp => {
        console.log(resp);
        return resp
    }),
    catchError(err => {
      if(err.error.errors){
        return of(err.error.errors[0].msg)
      }else{
        return of(err.error.msg)
      }
    })
    )
  }

  deleteAlmacen(id:string){
    const headers = this.getToken()
    return this.http.delete(`${this.baseUrl}/warehouses/${id}`, {headers}).pipe(
      map( resp => {
        console.log(resp);
        return resp
    }),
    catchError(err => {
      if(err.error.errors){
        return of(err.error.errors[0].msg)
      }else{
        return of(err.error.msg)
      }
    })
    )
  }

  buscarAlmacen(nombre:string){
    const headers = this.getToken()
    return this.http.get(`${this.baseUrl}/buscar/almacenes/${nombre}`, {headers}).pipe(
      map( resp => {
        console.log(resp);
        return resp
    }),
    catchError(err => {
      if(err.error.errors){
        return of(err.error.errors[0].msg)
      }else{
        return of(err.error.msg)
      }
    })
    )
  }
}
