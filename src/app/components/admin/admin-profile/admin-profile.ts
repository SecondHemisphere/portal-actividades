import { Component, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../../services/auth.service';
import { User } from '../../../models/User';
import { ServUsersApi } from '../../../services/serv-users-api';
import { UiAlertService } from '../../../shared/ui-alert.service';
import { ApiErrorService } from '../../../shared/api-error.service';

declare const bootstrap: any;

@Component({
  selector: 'app-admin-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './admin-profile.html',
  styleUrl: './admin-profile.css'
})
export class AdminProfile implements OnInit, AfterViewInit {

  admin!: User;
  formAdmin!: FormGroup;

  photoPreview: string | null = null;
  modalRef: any;

  @ViewChild('adminModalRef') modalElement!: ElementRef;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private usersService: ServUsersApi,
    private apiError: ApiErrorService,
    private ui: UiAlertService
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
      phone: admin.phone,
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

    this.ui.confirm(
      '¿Actualizar perfil?',
      'Se guardarán los cambios realizados en tu perfil.'
    ).then(result => {
      if (!result.isConfirmed) return;

      this.usersService.update(payload).subscribe({
        next: () => {
          this.admin = payload;
          this.photoPreview = payload.photoUrl || null;

          this.authService.updateCurrentUser(payload);

          this.ui.success('Perfil actualizado correctamente');
          this.modalRef.hide();
        },
        error: (err) => {
          this.apiError.handle(err, 'actualizar el perfil');
        }
      });
    });
  }

  resetPassword() {
    this.ui.confirm(
      '¿Resetear contraseña?',
      'La nueva contraseña será generada automáticamente.'
    ).then(result => {
      if (!result.isConfirmed) return;

      this.usersService.resetPassword(this.admin.id!).subscribe({
        next: (res: any) => {
          this.ui.success(`Contraseña reseteada. Nueva contraseña temporal: "${res.temporaryPassword}"`);
        },
        error: () => {
          this.ui.error('No se pudo resetear la contraseña');
        }
      });
    });
  }
  
}
