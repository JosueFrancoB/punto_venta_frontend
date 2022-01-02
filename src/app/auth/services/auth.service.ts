import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

import {Observable, of} from 'rxjs'
import { map, catchError, tap } from 'rxjs/operators';

import { AuthResponse, Usuario } from '../interfaces/interfaces';


@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private baseUrl: string = environment.baseUrl;
  private _usuario!: Usuario;

  get usuario(){
    return {...this._usuario};
  }

  constructor(private http: HttpClient) { }

  registro(nombre: string, correo: string, password: string, rol:string = 'USER_ROLE'){
    //TODO: Hacer eue el administrador pueda crear otro usuario administrador
    const url = `${this.baseUrl}/users`;
    const body = {nombre, correo, password, rol};
    return this.http.post<AuthResponse>(url, body)
    .pipe(
      tap(resp =>{
        console.log(`La respuesta ${resp}`);
        if (resp.ok){
          localStorage.setItem('x-token', resp.token!);
          this._usuario = {
            nombre: resp.nombre,
            uid: resp.uid,
          }
        }
      }),
      map(resp => resp.ok),
      catchError(err => {
        console.log(`${err.error.msg}`)
        // of(err.error.msg)
        return of()
      })
    )
  }

  login(correo: string, password: string){
    const url = `${this.baseUrl}/auth/login`;
    const body = {correo, password};
    return this.http.post<AuthResponse>(url, body)
    .pipe(
      tap(resp =>{
        if (resp.ok){
          localStorage.setItem('x-token', resp.token!);
          this._usuario = {
            nombre: resp.nombre,
            uid: resp.uid,
          }
        }
      }),
      map(resp => resp.ok),
      catchError(err => of(err.error.msg))
    )
  }

  validarToken(): Observable<boolean>{
    const url = `${this.baseUrl}/auth/renew`;
    //? El || en caso de que no tenga token mando un string vacio
    const headers = new HttpHeaders()
      .set('x-token', localStorage.getItem('x-token') || '')
    return this.http.get<AuthResponse>(url, {headers})
      .pipe(
        map( resp => {
          console.log(`${resp.token}`);
            localStorage.setItem('x-token', resp.token!);
            this._usuario = {
              nombre: resp.nombre,
              uid: resp.uid,
            }
            return resp.ok
        }),
        catchError(err => of(false))
      )
  }

  logout(){
    localStorage.removeItem('x-token');
  }
}
