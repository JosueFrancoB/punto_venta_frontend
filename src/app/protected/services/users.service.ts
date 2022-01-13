import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment.prod';
import { UserBody, UserData } from '../interfaces/protected-interfaces';
import {Observable, of} from 'rxjs'
import { map, catchError, tap } from 'rxjs/operators';


@Injectable({
  providedIn: 'root'
})
export class UsersService {
  private baseUrl:string = environment.baseUrl
  private _token:string = ''
  constructor(private http:HttpClient) { }

  getToken(){
    return new HttpHeaders()
      .set('x-token', localStorage.getItem('x-token') || '')
  }

  getUsers(){
    const headers = this.getToken()
    return this.http.get<UserData>(`${this.baseUrl}/users`, {headers})
      .pipe(
        map( resp => {
            return resp
        }),
        catchError(err => {
          console.log(`${err.error.msg}`)
          // of(err.error.msg)
          return of(err.error.msg)
        })
      )
  }
  getUser(id:string){
    const headers = this.getToken()
    return this.http.get(`${this.baseUrl}/users/${id}`, {headers}).pipe(
      map( resp => {
        return resp
    }),
    catchError(err => {
      return of(err.error.errors[0].msg)
    })
  )
  }
  addUser(user_data: UserBody){
    const headers = this.getToken()
    const body = user_data;
    return this.http.post(`${this.baseUrl}/users`, body, {headers}).pipe(
      map( resp => {
        return resp
    }),
    catchError(err => {
      return of(err.error.errors[0].msg)
    })
  )
  }
  updateUser(id:string, user_data: UserBody){
    const headers = this.getToken()
    const body = user_data
    return this.http.put(`${this.baseUrl}/users/${id}`, body, {headers}).pipe(
      map( resp => {
        return resp
    }),
    catchError(err => {
      console.log(err.error)
      // of(err.error.msg)
      return of(err.error.msg)
    })
  )
  }
  deleteUser(id:string){
    const headers = this.getToken()
    return this.http.delete(`${this.baseUrl}/users/${id}`, {headers}).pipe(
      map( resp => {
        return resp
    }),
    catchError(err => {
      return of(err.error.msg)
    })
  )
  }

  subirArchivo(archivos: Array<string>, id:string){
    const formularioDatos = new FormData();
    archivos.forEach(archivo => {
      formularioDatos.append('archivo', archivo)
    });
    return this.http.post(`${this.baseUrl}/uploads/users/${id}`, formularioDatos)
  }
}
