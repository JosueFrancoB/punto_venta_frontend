import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { ProveedoresData, ProveedoresBody } from '../interfaces/protected-interfaces';
import {Observable, of} from 'rxjs'
import { map, catchError, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ProveedoresService {

  private baseUrl:string = environment.baseUrl
  constructor(private http:HttpClient) { }

  getToken(){
    return new HttpHeaders()
      .set('x-token', localStorage.getItem('x-token') || '')
  }

  getProveedores(){
    const headers = this.getToken()
    return this.http.get<ProveedoresData>(`${this.baseUrl}/providers`, {headers})
      .pipe(
        map( resp => {
            return resp
        }),
        catchError(err => {
          console.log(`${err.error.msg}`)
          // of(err.error.msg)
          return of()
        })
      )
  }
  getProveedor(id:string){
    const headers = this.getToken()
    return this.http.get(`${this.baseUrl}/providers/${id}`, {headers}).pipe(
      map( resp => {
        return resp
    }),
    catchError(err => {
      console.log(err);
      console.log(err.error);
      console.log(err.error.errors[0].msg);
      return of(err.error.errors[0].msg)
    })
    )
  }
  addProveedor(provedor_data: any){
    const headers = this.getToken()
    console.log(provedor_data);
    provedor_data.correos = [provedor_data.correo]
    provedor_data.telefonos = [provedor_data.telefono]
    provedor_data.direcciones = [provedor_data.direccion]
    provedor_data.correos = provedor_data.correo
    let body = provedor_data
    return this.http.post(`${this.baseUrl}/providers`, body, {headers}).pipe(
      map( resp => {
        console.log(resp);
        return resp
    }),
    catchError(err => {
      if (err.error.errors){
        return of(err.error.errors[0])
      }else{
        return of(err.error)
      }
    })
    )
  }
  updateProveedor(id:string|undefined, proveedor: ProveedoresBody){
    const headers = this.getToken()
    let body = proveedor
    return this.http.patch(`${this.baseUrl}/providers/${id}`, body, {headers}).pipe(
      map( resp => {
        console.log(resp);
        return resp
    }),
    catchError(err => {
      if (err.error.errors){
        return of(err.error.errors[0])
      }else{
        return of(err.error)
      }
    })
    )
  }
  deleteProveedor(id:string){
    const headers = this.getToken()
    return this.http.delete(`${this.baseUrl}/providers/${id}`, {headers}).pipe(
      map( resp => {
        console.log(resp);
        return resp
    }),
    catchError(err => {
      if (err.error.errors){
        return of(err.error.errors[0])
      }else{
        return of(err.error)
      }
    })
    )
  }
}
