import { Component, OnInit } from '@angular/core';
import { CategoriasService } from '../../services/categorias.service';

@Component({
  selector: 'app-products',
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.scss']
})
export class ProductsComponent implements OnInit{

  categorias: Array<string> = []
  constructor(private categoriasService: CategoriasService) { }
  ngOnInit() {
    this.categoriasService.getCategories().subscribe(res =>{
      const {categorias} = res
      console.log(categorias);
      categorias.forEach(categoria => {
        this.categorias.push(categoria.nombre)
      });
    })
  }

}
