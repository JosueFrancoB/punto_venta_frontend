import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { ProductosData } from '../interfaces/protected-interfaces';
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
  getProduct(id:string){
    const headers = this.getToken()
    return this.http.get(`${this.baseUrl}/productos`, {headers})
  }
  addProduct(product_data: ProductosData){
    const headers = this.getToken()
    let body = {product_data}
    return this.http.post(`${this.baseUrl}/productos`, {headers, body})
  }
  updateProduct(id:string, product_data: ProductosData){
    const headers = this.getToken()
    let body = {product_data}
    return this.http.put(`${this.baseUrl}/productos/${id}`, {headers, body})
  }
  deleteProduct(id:string){
    const headers = this.getToken()
    return this.http.delete(`${this.baseUrl}/productos/${id}`, {headers})
  }
}
