import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import Swal from 'sweetalert2';
import { AuthService } from '../../../services/auth.service';
import { User } from '../../../models/User';
import { ServUsersApi } from '../../../services/serv-users-api';

declare const bootstrap: any;

@Component({
  selector: 'app-admin-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './admin-profile.html',
  styleUrl: './admin-profile.css'
})
export class AdminProfile implements OnInit {

  admin!: User;
  formAdmin!: FormGroup;

  photoPreview: string | null = null;
  modalRef: any;

  @ViewChild('adminModalRef') modalElement!: ElementRef;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private usersService: ServUsersApi
  ) {}

  ngOnInit(): void {
    const userId = this.authService.getUserId();
    if (!userId) return;

    this.usersService.getUserById(Number(userId)).subscribe(user => {
      this.admin = user;
      this.photoPreview = user.photoUrl || null;
      this.initForm();
    });
  }

  ngAfterViewInit() {
    this.modalRef = new bootstrap.Modal(this.modalElement.nativeElement);
  }

  initForm() {
    this.formAdmin = this.fb.group({
      name: [this.admin.name, [Validators.required, Validators.minLength(3), Validators.maxLength(50)]],
      email: [this.admin.email, [Validators.required, Validators.email]],
      phone: [this.admin.phone, [Validators.required, Validators.pattern(/^\+?[0-9]{7,15}$/)]],
      photoUrl: [this.admin.photoUrl || '']
    });
  }

  openEditProfile(admin: User) {
    this.formAdmin.patchValue({
      name: admin.name,
      email: admin.email,

      photoUrl: admin.photoUrl || ''
    });

    this.photoPreview = admin.photoUrl || null;
    this.modalRef.show();
  }

  updatePhotoPreview() {
    const url = this.formAdmin.get('photoUrl')?.value;
    this.photoPreview = url && url.trim() !== '' ? url : null;
  }

  save() {
    if (this.formAdmin.invalid) {
      this.formAdmin.markAllAsTouched();
      return;
    }

    const payload: User = {
      ...this.admin,
      ...this.formAdmin.value
    };

    Swal.fire({
      title: '¿Actualizar perfil?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sí, guardar',
      cancelButtonText: 'Cancelar'
    }).then(result => {
      if (result.isConfirmed) {
        this.usersService.update(payload).subscribe({
          next: () => {
            this.admin = payload;
            this.photoPreview = payload.photoUrl || null;

            this.authService.updateCurrentUser(payload);

            Swal.fire({
              icon: 'success',
              title: 'Perfil actualizado',
              timer: 1500,
              showConfirmButton: false
            });

            this.modalRef.hide();
          },
          error: (err) => {
            let errorMsg = 'Error al actualizar el perfil';
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
    });
  }

  resetPassword() {
    Swal.fire({
      title: '¿Resetear contraseña?',
      text: 'La nueva contraseña será generada automáticamente',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, resetear',
      cancelButtonText: 'Cancelar'
    }).then(result => {
      if (result.isConfirmed) {
        this.usersService.resetPassword(this.admin.id!).subscribe({
          next: (res: any) => {
            Swal.fire({
              icon: 'success',
              title: 'Contraseña reseteada',
              html: `
                <b>Nueva contraseña temporal:</b><br>
                <code>${res.temporaryPassword}</code>
              `
            });
          },
          error: () => {
            Swal.fire('Error', 'No se pudo resetear la contraseña', 'error');
          }
        });
      }
    });
  }
}
