import { Injectable } from '@angular/core';
import { catchError, map, of } from 'rxjs';
import { environment } from 'src/environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { SalesBody, SalesData } from '../interfaces/protected-interfaces';


@Injectable({
  providedIn: 'root'
})
export class SalesService {

  private baseUrl:string = environment.baseUrl
  constructor(private http:HttpClient) { }
  getToken(){
    return new HttpHeaders()
      .set('x-token', localStorage.getItem('x-token') || '')
  }

  getSales(){
    const headers = this.getToken()
    return this.http.get<SalesData>(`${this.baseUrl}/sales`, {headers})
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

  getSale(id:string){
    const headers = this.getToken()
    return this.http.get(`${this.baseUrl}/sales/${id}`, {headers}).pipe(
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

  addSale(sale: SalesBody){
    const headers = this.getToken()
    console.log(sale);
    let body = sale
    return this.http.post(`${this.baseUrl}/sales`, body, {headers}).pipe(
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

  updateSale(id:string, sale: SalesBody){
    const headers = this.getToken()
    let body = sale
    return this.http.patch(`${this.baseUrl}/sales/${id}`, body, {headers}).pipe(
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

  deleteSale(id:string){
    const headers = this.getToken()
    return this.http.delete(`${this.baseUrl}/sales/${id}`, {headers}).pipe(
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

  cancelSale(id:string){
    const headers = this.getToken()
    return this.http.patch(`${this.baseUrl}/sales/cancel/${id}`, {headers}).pipe(
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
