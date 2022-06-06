import { Component, Output, EventEmitter, OnInit } from '@angular/core';
import { debounceTime, Subject } from 'rxjs';

@Component({
  selector: 'app-input-search',
  templateUrl: './input-search.component.html',
  styleUrls: ['./input-search.component.scss']
})
export class InputSearchComponent implements OnInit {

  @Output() onEnter: EventEmitter<string> = new EventEmitter();
  @Output() onDebounce: EventEmitter<string> = new EventEmitter();
  
  debouncer: Subject<string> = new Subject();
  search_term:string = ''

  //El constructor se dispara cada que estoy en el componente
  // OnInit Se dispara una única vez cuando el componente es creado
  ngOnInit(): void {
    // En el debounceTime es cuantos milisegundos espera para emitir el siguiente valor del subscribe
    this.debouncer
      .pipe(debounceTime(300))
      .subscribe(valor =>{
        this.onDebounce.emit(valor);
    })
  }


  search(){
    this.onEnter.emit(this.search_term);
  }

  // Cada que presiono tecla al usar el next se conecta al subscribe del debouncer en OnInit
  teclaPresionada(){
    this.debouncer.next(this.search_term)
  }



}
