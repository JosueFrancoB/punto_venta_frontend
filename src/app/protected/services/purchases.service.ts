import { Injectable } from '@angular/core';
import { catchError, map, of } from 'rxjs';
import { environment } from 'src/environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { PurchasesBody, PurchasesData } from '../interfaces/protected-interfaces';


@Injectable({
  providedIn: 'root'
})
export class PurchasesService {

  private baseUrl:string = environment.baseUrl
  constructor(private http:HttpClient) { }
  getToken(){
    return new HttpHeaders()
      .set('x-token', localStorage.getItem('x-token') || '')
  }

  getPurchases(limit:number,from:number, search:string, search_field:string){
    const headers = this.getToken()
    let url = `${this.baseUrl}/purchases?limite=${limit}&desde=${from}`
    if(search)
      url += `&search=${search}`
    if(search_field)
      url += `&search_fields=${JSON.stringify([search_field])}`
    return this.http.get<PurchasesData>(url, {headers})
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

  getPurchase(id:string){
    const headers = this.getToken()
    return this.http.get(`${this.baseUrl}/purchases/${id}`, {headers}).pipe(
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

  addPurchase(purchase: PurchasesBody){
    const headers = this.getToken()
    console.log(purchase);
    let body = purchase
    return this.http.post(`${this.baseUrl}/purchases`, body, {headers}).pipe(
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

  updatePurchase(id:string, purchase: PurchasesBody){
    const headers = this.getToken()
    let body = purchase
    return this.http.patch(`${this.baseUrl}/purchases/${id}`, body, {headers}).pipe(
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

  deletePurchase(id:string){
    const headers = this.getToken()
    return this.http.delete(`${this.baseUrl}/purchases/${id}`, {headers}).pipe(
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
