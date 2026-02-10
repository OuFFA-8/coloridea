import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthServices } from '../../../core/services/auth-services/auth-services';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  imports: [],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  loginForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private authService: AuthServices,
    private router: Router,
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
    });
  }

  onSubmit() {
    if (this.loginForm.valid) {
      this.authService.login(this.loginForm.value).subscribe({
        next: (res) => {
          console.log('Login Success!', res);
          // هنا بنخزن التوكن اللي هيرجع في الـ LocalStorage
          localStorage.setItem('token', res.token);
          this.router.navigate(['/admin/clients']); // وديه على الصفحة اللي كنا شغالين فيها
        },
        error: (err) => {
          alert('بيانات الدخول غلط يا صديقي، تأكد من الإيميل والباسورد');
        },
      });
    }
  }
}
