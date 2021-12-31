import { Component} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

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

  miFormulario: FormGroup = this.fb.group({
    name: ['', [Validators.required] ],
    email: ['', [Validators.required, Validators.email] ],
    password: ['', [Validators.required, Validators.minLength(6)] ]
  })

  constructor(private fb: FormBuilder, private router:Router) { }
  register(){
    console.log(this.miFormulario.value)
    this.router.navigateByUrl('/dashboard')
  }
}
