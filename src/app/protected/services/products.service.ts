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
          if(err.error.errors){
            return of(err.error.errors[0].msg)
          }else{
            return of(err.error.msg)
          }
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
          if(err.error.errors){
            return of(err.error.errors[0].msg)
          }else{
            return of(err.error.msg)
          }
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
      if(err.error.errors){
        return of(err.error.errors[0].msg)
      }else{
        return of(err.error.msg)
      }
    })
    )
  }

  searchProducts(search:string, filter:string='nombre'){
    const headers = this.getToken()
    return this.http.get(`${this.baseUrl}/buscar/productos/${search}?filter=${filter}`, {headers}).pipe(
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

  addProduct(product_data: ProductosBody, categoria: string){
    const headers = this.getToken()
    console.log(product_data);
    product_data.categoria = categoria
    let body = product_data
    return this.http.post(`${this.baseUrl}/productos`, body, {headers}).pipe(
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

  updateProduct(id:string, product_data: ProductosBody, categoria: string){
    const headers = this.getToken()
    product_data.categoria = categoria
    let body = product_data
    return this.http.patch(`${this.baseUrl}/productos/${id}`, body, {headers}).pipe(
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

  deleteProduct(id:string){
    const headers = this.getToken()
    return this.http.delete(`${this.baseUrl}/productos/${id}`, {headers}).pipe(
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
