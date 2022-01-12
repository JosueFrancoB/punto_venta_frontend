import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { CategoriasData } from '../interfaces/protected-interfaces';
import {Observable, of} from 'rxjs'
import { map, catchError, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class CategoriasService {

  private baseUrl:string = environment.baseUrl
  constructor(private http:HttpClient) { }

  getToken(){
    return new HttpHeaders()
      .set('x-token', localStorage.getItem('x-token') || '')
  }

  getCategories(){
    const headers = this.getToken()
    return this.http.get<CategoriasData>(`${this.baseUrl}/categorias`, {headers})
      .pipe(
        map( resp => {
          console.log(resp);
            return resp
        }),
        catchError(err => {
          console.log(`${err.error.msg}`)
          // of(err.error.msg)
          return of()
        })
      )
  }
  getCategory(id:string){
    const headers = this.getToken()
    return this.http.get(`${this.baseUrl}/categorias`, {headers})
  }
  addCategory(categoria_data: any){
    const headers = this.getToken()
    let body = categoria_data
    return this.http.post(`${this.baseUrl}/categorias`, body, {headers}).pipe(
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
  updateCategory(id:string, categoria_data: any){
    const headers = this.getToken()
    let body = {categoria_data}
    return this.http.put(`${this.baseUrl}/categorias/${id}`, body, {headers}).pipe(
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
  deleteCategory(id:string){
    const headers = this.getToken()
    return this.http.delete(`${this.baseUrl}/categorias/${id}`, {headers}).pipe(
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
