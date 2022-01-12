import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import {Observable, of} from 'rxjs'
import { map, catchError, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class UploadsService {

  private baseUrl:string = environment.baseUrl
  constructor(private http:HttpClient) { }

  getToken(){
    return new HttpHeaders()
      .set('x-token', localStorage.getItem('x-token') || '')
  }

  subirArchivo(files: Array<any>, collection: string){
    const formularioDatos = new FormData;
    files.forEach(file =>{
      console.log(file);
      formularioDatos.append('files', file)
    })

    const headers = this.getToken()
    return this.http.post(`${this.baseUrl}/uploads`, formularioDatos, {headers})
      .pipe(
        map( resp => {
          console.log(resp);
            return resp
        }),
        catchError(err => {
          console.log(err.error.msg)
          console.log(err.error)
          console.log(err)
          // of(err.error.msg)
          return of(err)
        })
      )
}

  cargarImg(files: Array<any>, collection: string, id: string){
    const formularioDatos = new FormData;
    files.forEach(file =>{
      console.log('entre a cargar img', file);
      formularioDatos.append('archivo', file)
    })

    const headers = this.getToken()
    return this.http.put(`${this.baseUrl}/uploads/${collection}/${id}`, formularioDatos, {headers})
      .pipe(
        map( resp => {
          console.log(resp);
            return resp
        }),
        catchError(err => {
          console.log(err.error.msg)
          console.log(err.error)
          console.log(err)
          // of(err.error.msg)
          return of(err)
        })
      )
  }

}
