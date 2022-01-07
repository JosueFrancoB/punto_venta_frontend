import { Component} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { NbWindowRef } from '@nebular/theme';


@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styles: [
    `
    .card-content{
      display: flex; justify-content: center;
    }
    .auth-footer{
      display: flex; flex-wrap: wrap; flex-direction: column;
    }
    .text-center{
      text-align: center;
    }
    `
  ]
})
export class RegisterComponent {

  correoPattern: string = "^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$"

  miFormulario: FormGroup = this.fb.group({
    nombre: ['', [Validators.required] ],
    correo: ['', [Validators.required, Validators.pattern(this.correoPattern)] ],
    password: ['', [Validators.required, Validators.minLength(6)] ]
  })


  get EmailErrorMsg(): string{
    const errors = this.miFormulario.get('correo')?.errors
    if (errors?.['required']){
      return 'El correo es obligatorio';
    }else if(errors?.['pattern']){
      return 'El correo no es válido';
    }
    return '';
  }

  get PasswordErrorMsg(): string{
    const errors = this.miFormulario.get('password')?.errors
    if (errors?.['required']){
      return 'La contraseña es obligatoria!';
    }else if(errors?.['minlength']){
      return 'La contraseña debe de tener 6 o más caracteres';
    }
    return '';
  }

  constructor(private fb: FormBuilder, private router:Router, 
              private authService:AuthService,
              public windowRef: NbWindowRef) { }
  registro(){
      if (this.miFormulario.invalid){
        this.miFormulario.markAllAsTouched()
        return
      }
      console.log(this.miFormulario.value)
      const {nombre, correo, password} = this.miFormulario.value
      this.authService.registro(nombre, correo, password)
        .subscribe(resp =>{
          if (resp === true){
            this.router.navigateByUrl('/dashboard')
          }else{
            //TODO: Mostrar mensaje de error
          }
        })
  }

  get miFormularioControls(): any {
    return this.miFormulario['controls'];
  }

  campoNoValido(campo:string){
    return this.miFormularioControls[campo].errors && this.miFormularioControls[campo].touched
  }

  close() {
    this.windowRef.close();
  }
  

}
