import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../services/auth/auth-service';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { UserRole } from '../../../models/User';

@Component({
  selector: 'app-login',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  loginForm: FormGroup;
  error = '';

  constructor(private fb: FormBuilder, private authService: AuthService, private router: Router) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
    });
  }

  login() {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    const { email } = this.loginForm.value;

    this.authService.login(email).subscribe({
      next: user => {
        console.log('Usuario logueado:', user);
        this.error = '';

        switch (user.role) {
          case UserRole.Admin:
            this.router.navigate(['/admin/user-crud']);
            break;
          case UserRole.Organizador:
            this.router.navigate(['/organizer/dashboard']);
            break;
          case UserRole.Estudiante:
            this.router.navigate(['/student/enrollment-list']);
            break;
          default:
            this.router.navigate(['/activities']);
        }
      },
      error: err => {
        this.error = err.message || 'Usuario no encontrado';
      }
    });
  }

}
