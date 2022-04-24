import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { ClientesData, ClientesBody } from '../interfaces/protected-interfaces';
import {Observable, of} from 'rxjs'
import { map, catchError, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ClientesService {

  private baseUrl:string = environment.baseUrl
  constructor(private http:HttpClient) { }

  getToken(){
    return new HttpHeaders()
      .set('x-token', localStorage.getItem('x-token') || '')
  }

  getClientes(){
    const headers = this.getToken()
    return this.http.get<ClientesData>(`${this.baseUrl}/clientes`, {headers})
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
  getCliente(id:string){
    const headers = this.getToken()
    return this.http.get(`${this.baseUrl}/clientes/${id}`, {headers}).pipe(
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
  addCliente(client: any){
    const headers = this.getToken()
    console.log(client);
    let body = client
    return this.http.post(`${this.baseUrl}/clientes`, body, {headers}).pipe(
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
  updateCliente(id:string, client: ClientesBody){
    const headers = this.getToken()
    let body = client
    return this.http.patch(`${this.baseUrl}/clientes/${id}`, body, {headers}).pipe(
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
  deleteCliente(id:string){
    const headers = this.getToken()
    return this.http.delete(`${this.baseUrl}/clientes/${id}`, {headers}).pipe(
      map( resp => {
        console.log(resp);
        return resp
    }),
    catchError(err => {
      console.log(err);
      return of(err.error.msg)
    })
    )
  }
}
