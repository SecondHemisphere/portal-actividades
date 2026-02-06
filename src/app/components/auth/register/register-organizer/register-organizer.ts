import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';
import { AuthService } from '../../../../services/auth.service';

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
    private router: Router
  ) {
    this.registerForm = this.fb.group({
      name: ['', [Validators.required,Validators.minLength(3),Validators.maxLength(50),Validators.pattern(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)]],
      email: ['', [Validators.required,Validators.email]],
      password: ['', [Validators.required,Validators.minLength(8),Validators.maxLength(20),Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/)]],
      confirmPassword: ['', [Validators.required]],
      phone: ['', [Validators.required,Validators.pattern(/^\+?[0-9]{7,15}$/)]],
      department: ['', [Validators.required,Validators.minLength(2),Validators.maxLength(50)]],
      position: ['', [Validators.required,Validators.minLength(3),Validators.maxLength(50),Validators.pattern(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)]],
      bio: ['', [Validators.required,Validators.minLength(10),Validators.maxLength(300)]]
    }, { validator: this.passwordMatchValidator });
  }

  passwordMatchValidator(form: FormGroup) {
    const password = form.get('password')?.value;
    const confirmPassword = form.get('confirmPassword')?.value;
    
    if (password !== confirmPassword) {
      form.get('confirmPassword')?.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    }
    return null;
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
      if (errors.length > 0) {
        Swal.fire({
          icon: 'warning',
          title: 'Complete correctamente el formulario',
          html: `<div class="text-start"><small>${errors[0]}</small></div>`,
          confirmButtonText: 'Entendido'
        });
      }
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
      next: (response: any) => {
        this.isLoading = false;
        
        Swal.fire({
          icon: 'success',
          title: '¡Registro exitoso!',
          text: response?.message || 'El organizador ha sido registrado correctamente.',
          showConfirmButton: true,
          confirmButtonText: 'Continuar'
        }).then(() => {
          this.router.navigate(['/login']);
        });
      },
      error: (err) => {
        this.isLoading = false;
        let errorMsg = 'Error al crear la cuenta';

        if (err.error) {
          if (err.error.name) errorMsg = err.error.name.join(', ');
          if (err.error.email) errorMsg = err.error.email.join(', ');
        }
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: errorMsg
        });
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

  get passwordStrength(): { score: number, text: string, color: string } {
    const password = this.registerForm.get('password')?.value || '';
    
    if (!password) {
      return { score: 0, text: '', color: '#e9ecef' };
    }

    let score = 0;
    
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[a-z]/.test(password)) score++;
    if (/\d/.test(password)) score++;
    if (/[@$!%*?&]/.test(password)) score++;

    const strengthMap = [
      { text: 'Muy débil', color: '#dc3545' },
      { text: 'Débil', color: '#fd7e14' },
      { text: 'Regular', color: '#ffc107' },
      { text: 'Fuerte', color: '#28a745' },
      { text: 'Muy fuerte', color: '#20c997' }
    ];

    return {
      score,
      text: strengthMap[score - 1]?.text || strengthMap[0].text,
      color: strengthMap[score - 1]?.color || strengthMap[0].color
    };
  }

  get bioCharacterCount(): number {
    return this.registerForm.get('bio')?.value?.length || 0;
  }

}