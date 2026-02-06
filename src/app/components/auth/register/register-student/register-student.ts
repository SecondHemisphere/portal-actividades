import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink, } from '@angular/router';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';
import { AuthService } from '../../../../services/auth.service';
import { passwordMatchValidator } from '../../../../validators/passwordMatchValidator';
import { ServDropdownsApi } from '../../../../services/serv-dropdowns-api';
import { Modality, Schedule } from '../../../../models/Student';

@Component({
  selector: 'app-register-student',
  imports: [ReactiveFormsModule, CommonModule, RouterLink],
  templateUrl: './register-student.html',
  styleUrl: './register-student.css',
})
export class RegisterStudent {
  registerForm: FormGroup;
  isLoading = false;
  passwordVisible = false;
  confirmPasswordVisible = false;
  
  faculties: any[] = [];
  careers: any[] = [];

  modalities = Object.values(Modality);
  schedules = Object.values(Schedule);

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private dropdownsService: ServDropdownsApi,
    private router: Router
  ) {
    this.registerForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(50), Validators.pattern(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(20)]],
      confirmPassword: ['', [Validators.required]],
      phone: ['', [Validators.required, Validators.pattern(/^\+?[0-9]{7,15}$/)]],
      facultyId: ['', [Validators.required]],
      careerId: ['', [Validators.required]],
      semester: ['', [Validators.required, Validators.min(1), Validators.max(10)]],
      modality: ['', [Validators.required]],
      schedule: ['', [Validators.required]]
    }, { validators: passwordMatchValidator() });
    
    this.loadFaculties();
  }

  loadFaculties() {
    this.dropdownsService.getFacultiesWithCareers().subscribe({
      next: (faculties) => {
        this.faculties = faculties;
        if (faculties.length > 0 && faculties[0].careers) {
          this.careers = faculties[0].careers;
          if (this.careers.length > 0) {
            this.registerForm.patchValue({
              facultyId: faculties[0].id,
              careerId: this.careers[0].id
            });
          }
        }
      },
      error: (err) => {
        console.error('Error loading faculties:', err);
      }
    });
  }

  onFacultyChange(event: any) {
    const facultyId = event.target.value;
    const selectedFaculty = this.faculties.find(f => f.id == facultyId);
    this.careers = selectedFaculty?.careers || [];
    
    if (this.careers.length > 0) {
      this.registerForm.patchValue({ careerId: this.careers[0].id });
    } else {
      this.registerForm.patchValue({ careerId: '' });
    }
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
      careerId: parseInt(this.registerForm.get('careerId')?.value),
      semester: parseInt(this.registerForm.get('semester')?.value),
      modality: this.registerForm.get('modality')?.value,
      schedule: this.registerForm.get('schedule')?.value
    };

    this.authService.registerStudent(formData).subscribe({
      next: (response: any) => {
        this.isLoading = false;
        
        Swal.fire({
          icon: 'success',
          title: '¡Registro exitoso!',
          text: response?.message || 'El estudiante ha sido registrado correctamente.',
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
          'min': `El valor mínimo es ${control.errors['min']?.min}`,
          'max': `El valor máximo es ${control.errors['max']?.max}`,
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
      'facultyId': 'Facultad',
      'careerId': 'Carrera',
      'semester': 'Semestre',
      'modality': 'Modalidad',
      'schedule': 'Jornada'
    };
    return fieldNames[field] || field;
  }
}