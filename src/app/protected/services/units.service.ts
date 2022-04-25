import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, map, of } from 'rxjs';
import { environment } from 'src/environments/environment';
import { UnitsBody, UnitsData } from '../interfaces/protected-interfaces';

@Injectable({
  providedIn: 'root'
})
export class UnitsService {

  private baseUrl:string = environment.baseUrl
  constructor(private http:HttpClient) { }
  getToken(){
    return new HttpHeaders()
      .set('x-token', localStorage.getItem('x-token') || '')
  }

  getUnidades(){
    const headers = this.getToken()
    return this.http.get<UnitsData>(`${this.baseUrl}/attributes/units`, {headers})
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
  getUnidad(id:string){
    const headers = this.getToken()
    return this.http.get(`${this.baseUrl}/attributes/units/${id}`, {headers}).pipe(
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
  addUnidad(unit: any){
    const headers = this.getToken()
    console.log(unit);
    let body = unit
    return this.http.post(`${this.baseUrl}/attributes/units`, body, {headers}).pipe(
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
  updateUnidad(id:string, unit: UnitsBody){
    const headers = this.getToken()
    let body = unit
    return this.http.patch(`${this.baseUrl}/attributes/units/${id}`, body, {headers}).pipe(
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
  deleteUnidad(id:string){
    const headers = this.getToken()
    return this.http.delete(`${this.baseUrl}/attributes/units/${id}`, {headers}).pipe(
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
