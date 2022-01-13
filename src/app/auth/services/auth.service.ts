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

  registro(nombre: string, correo: string, password: string, rol:string = 'Usuario', img:string = ''){
    //TODO: Hacer eue el administrador pueda crear otro usuario administrador
    const url = `${this.baseUrl}/users/register`;
    const body = {nombre, correo, password, rol, img};
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
      catchError(err => {
        return of(err.error.errors[0].msg)
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
    localStorage.clear();
  }
}
