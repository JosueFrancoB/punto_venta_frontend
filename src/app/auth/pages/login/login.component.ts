import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
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
export class LoginComponent{

  correoPattern: string = "^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$"
  miFormulario: FormGroup = this.fb.group({
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

  public msg_err:string = ''
  public ok:boolean = false

  constructor(private fb: FormBuilder, 
              private router:Router,
              private authService: AuthService) { }
  
  login(){
    if (this.miFormulario.invalid){
      this.miFormulario.markAllAsTouched()
      return
    }
    console.log(this.miFormulario.value)
    const {correo, password} = this.miFormulario.value
    this.authService.login(correo, password)
      .subscribe(resp =>{
        if (resp === true){
          this.ok = resp
          this.router.navigateByUrl('/dashboard')
        }else{
          this.ok = false
          this.msg_err = resp
        }
      })
  }

  get miFormularioControls(): any {
    return this.miFormulario['controls'];
  }

  campoNoValido(campo:string){
    return this.miFormularioControls[campo].errors && this.miFormularioControls[campo].touched
  }
}
