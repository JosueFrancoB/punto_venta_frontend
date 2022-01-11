import { Component, Input } from '@angular/core';

@Component({
  selector: 'image-uploader',
  template: `
    <label class="uploader" ondragover="return false;"
    [class.loaded]="loaded" 
    [style.outlineColor]="dragging ? activeColor : baseColor"
    (dragenter)="handleDragEnter()"
    (dragleave)="handleDragLeave()"
    (drop)="handleDrop($event)">
    
    <i class="icon icon-upload glyphicon glyphicon-upload" 
        [style.color]="dragging 
            ? ((imageSrc.length > 0) ? overlayColor : activeColor)
            : ((imageSrc.length > 0) ? overlayColor : baseColor)"></i>
    
    <img 
        [src]="imageSrc" 
        (load)="handleImageLoad()" 
        [class.loaded]="imageLoaded"/>
    
    <input type="file" name="file" accept="image/*"
        (change)="handleInputChange($event)">
</label>
  `,
  styleUrls: ['./image-uploader.component.scss'],
  inputs:['activeColor','baseColor','overlayColor']
})

export class ImageUploaderComponent {
    
    activeColor: string = 'green';
    baseColor: string = '#ccc';
    overlayColor: string = 'rgba(255,255,255,0.5)';
    
    dragging: boolean = false;
    loaded: boolean = false;
    imageLoaded: boolean = false;
    imageSrc: string = '';
    
    handleDragEnter() {
        this.dragging = true;
    }
    
    handleDragLeave() {
        this.dragging = false;
    }
    
    handleDrop(e:any) {
        e.preventDefault();
        this.dragging = false;
        this.handleInputChange(e);
    }
    
    handleImageLoad() {
        this.imageLoaded = true;
    }

    handleInputChange(e:any) {
        var file = e.dataTransfer ? e.dataTransfer.files[0] : e.target.files[0];

        var pattern = /image-*/;
        var reader = new FileReader();

        if (!file.type.match(pattern)) {
            alert('invalid format');
            return;
        }

        this.loaded = false;

        reader.onload = this._handleReaderLoaded.bind(this);
        reader.readAsDataURL(file);
    }
    
    _handleReaderLoaded(e:any) {
        var reader = e.target;
        this.imageSrc = reader.result;
        this.loaded = true;
    }
}