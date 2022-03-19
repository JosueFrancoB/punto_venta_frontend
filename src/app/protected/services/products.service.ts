import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { ProductosBody, ProductosData } from '../interfaces/protected-interfaces';
import {Observable, of} from 'rxjs'
import { map, catchError, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ProductsService {

  private baseUrl:string = environment.baseUrl
  constructor(private http:HttpClient) { }

  getToken(){
    return new HttpHeaders()
      .set('x-token', localStorage.getItem('x-token') || '')
  }

  getProducts(){
    const headers = this.getToken()
    return this.http.get<ProductosData>(`${this.baseUrl}/productos`, {headers})
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

  getProductsByCategoria(id: string){
    const headers = this.getToken()
    return this.http.get<ProductosData>(`${this.baseUrl}/productos/categoria/${id}`, {headers})
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

  getProduct(id:string){
    const headers = this.getToken()
    return this.http.get<ProductosBody>(`${this.baseUrl}/productos/${id}`, {headers}).pipe(
      map( resp => {
        console.log(resp);
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
  addProduct(product_data: ProductosBody){
    const headers = this.getToken()
    console.log(product_data);
    let body = product_data
    return this.http.post(`${this.baseUrl}/productos`, body, {headers}).pipe(
      map( resp => {
        console.log(resp);
        return resp
    }),
    catchError(err => {
      return of(err.error.errors[0].msg)
    })
    )
  }
  updateProduct(id:string, product_data: ProductosBody){
    const headers = this.getToken()
    let body = product_data
    return this.http.patch(`${this.baseUrl}/productos/${id}`, body, {headers}).pipe(
      map( resp => {
        console.log(resp);
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
  deleteProduct(id:string){
    const headers = this.getToken()
    return this.http.delete(`${this.baseUrl}/productos/${id}`, {headers}).pipe(
      map( resp => {
        console.log(resp);
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
}
