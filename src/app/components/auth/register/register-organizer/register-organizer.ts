import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../../services/auth.service';
import { passwordMatchValidator } from '../../../../validators/passwordMatchValidator';
import { ApiErrorService } from '../../../../shared/api-error.service';
import { UiAlertService } from '../../../../shared/ui-alert.service';

@Component({
  selector: 'app-register-organizer',
  imports: [ReactiveFormsModule, CommonModule, RouterLink],
  templateUrl: './register-organizer.html',
  styleUrl: './register-organizer.css',
})
export class RegisterOrganizer {
  registerForm: FormGroup;
  isLoading = false;
  passwordVisible = false;
  confirmPasswordVisible = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private ui: UiAlertService,
    private apiError: ApiErrorService
  ) {
    this.registerForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(50), Validators.pattern(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(20)]],
      confirmPassword: ['', [Validators.required]],
      phone: ['', [Validators.required, Validators.pattern(/^\+?[0-9]{7,15}$/)]],
      department: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
      position: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(50), Validators.pattern(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)]],
      bio: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(300)]]
    }, {  validators: passwordMatchValidator() });
  }

  togglePasswordVisibility(field: 'password' | 'confirmPassword') {
    if (field === 'password') {
      this.passwordVisible = !this.passwordVisible;
    } else {
      this.confirmPasswordVisible = !this.confirmPasswordVisible;
    }
  }

  onSubmit() {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      const errors = this.getFirstFormErrors();
      if (errors.length > 0) this.ui.warning(errors[0]);
      return;
    }

    this.isLoading = true;

    const formData = {
      name: this.registerForm.get('name')?.value,
      email: this.registerForm.get('email')?.value,
      password: this.registerForm.get('password')?.value,
      phone: this.registerForm.get('phone')?.value,
      department: this.registerForm.get('department')?.value,
      position: this.registerForm.get('position')?.value,
      bio: this.registerForm.get('bio')?.value
    };

    this.authService.registerOrganizer(formData).subscribe({
      next: () => {
        this.isLoading = false;
        this.ui.success('¡Registro exitoso!').then(() => {
          this.router.navigate(['/login']);
        });
      },
      error: (err) => {
        this.isLoading = false;
        this.apiError.handle(err, 'crear cuenta de organizador')
      }
    });
  }

  getFirstFormErrors(): string[] {
    const errors: string[] = [];
    
    const controls = this.registerForm.controls;
    for (const key in controls) {
      const control = controls[key];
      if (control.errors) {
        const errorMessages: { [key: string]: string } = {
          'required': 'Este campo es obligatorio',
          'minlength': `Mínimo ${control.errors['minlength']?.requiredLength} caracteres`,
          'maxlength': `Máximo ${control.errors['maxlength']?.requiredLength} caracteres`,
          'email': 'Correo electrónico inválido',
          'pattern': 'Formato inválido',
          'passwordMismatch': 'Las contraseñas no coinciden'
        };
        
        for (const errorKey in control.errors) {
          if (errorMessages[errorKey]) {
            const fieldName = this.getFieldDisplayName(key);
            errors.push(`${fieldName}: ${errorMessages[errorKey]}`);
            return errors;
          }
        }
      }
    }
    return errors;
  }

  getFieldDisplayName(field: string): string {
    const fieldNames: { [key: string]: string } = {
      'name': 'Nombre',
      'email': 'Correo electrónico',
      'password': 'Contraseña',
      'confirmPassword': 'Confirmar contraseña',
      'phone': 'Teléfono',
      'department': 'Departamento',
      'position': 'Cargo',
      'bio': 'Biografía'
    };
    return fieldNames[field] || field;
  }

  get bioCharacterCount(): number {
    return this.registerForm.get('bio')?.value?.length || 0;
  }

}