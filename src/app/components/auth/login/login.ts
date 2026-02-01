import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  loginForm: FormGroup;
  error: string | null = null;

  constructor(private fb: FormBuilder, private auth: AuthService, private router: Router) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      const { email, password } = this.loginForm.value;
      
      this.auth.login(email, password).subscribe({
        next: res => {
          this.auth.saveToken(res.token);

          const role = this.auth.getUserRole();

          if (role === 'Admin') {
            this.router.navigate(['/admin/dashboard']);
          } else if (role === 'Organizador') {
            this.router.navigate(['/organizer/my-activities']);
          } else if (role === 'Estudiante') {
            this.router.navigate(['/student/my-enrollments']);
          } else {
            this.router.navigate(['/']);
          }
        },
        error: err => {
          this.error = 'Credenciales inválidas';
        }
      });
    } else {
      this.loginForm.markAllAsTouched();
    }
  }

}
