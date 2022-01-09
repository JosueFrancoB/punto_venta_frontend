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
      console.log(`${err.error.msg}`)
      // of(err.error.msg)
      return of(err.error.msg)
    })
  )
  }
  addUser(nombre: string, correo: string, password: string, rol:string = 'Usuario', img:string = ''){
    const headers = this.getToken()
    const body = {nombre, correo, password, rol, img};
    return this.http.post(`${this.baseUrl}/users`, {headers, body}).pipe(
      map( resp => {
        return resp
    }),
    catchError(err => {
      console.log(err)
      // of(err.error.msg)
      return of(err.error.msg)
    })
  )
  }
  updateUser(id:string, body: UserBody){
    const headers = this.getToken()
    console.log(body);
    return this.http.put(`${this.baseUrl}/users/${id}`, {headers, body}).pipe(
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
  deleteUser(id:string){
    const headers = this.getToken()
    return this.http.delete(`${this.baseUrl}/users/${id}`, {headers}).pipe(
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

  subirArchivo(archivos: Array<string>, id:string){
    const formularioDatos = new FormData();
    archivos.forEach(archivo => {
      formularioDatos.append('archivo', archivo)
    });
    return this.http.post(`${this.baseUrl}/uploads/users/${id}`, formularioDatos)
  }
}
