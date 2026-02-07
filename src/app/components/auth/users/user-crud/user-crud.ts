import { Component, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { SearchFilter, SearchForm } from '../../../shared/search-form/search-form';
import { DataTable, TableColumn } from '../../../shared/data-table/data-table';
import { User, UserRole } from '../../../../models/User';
import { ServUsersApi } from '../../../../services/serv-users-api';
import Swal from 'sweetalert2';
import { AuthService } from '../../../../services/auth.service';

declare const bootstrap: any;

@Component({
  selector: 'app-user-crud',
  imports: [ReactiveFormsModule, DataTable, SearchForm],
  templateUrl: './user-crud.html',
  styleUrl: './user-crud.css',
})
export class UserCrud implements AfterViewInit {
  users: User[] = [];
  filteredUsers: User[] = [];
  formUser!: FormGroup;
  editingId: number | null = null;
  modalRef: any;

  userRoles = Object.values(UserRole);
  
  currentUserId: number | null = null;

  userFilters: SearchFilter[] = [
    { type: 'text', field: 'name', label: 'Nombre' },
    { type: 'text', field: 'email', label: 'Correo' },
    {
      type: 'select',
      field: 'role',
      label: 'Rol',
      options: Object.values(UserRole).map(v => ({ label: v, value: v }))
    }
  ];

  colArray: TableColumn[] = [
    { field: 'id', header: 'ID', type: 'number' },
    { field: 'name', header: 'Nombre' },
    { field: 'email', header: 'Correo' },
    { field: 'phone', header: 'Teléfono' },
    { field: 'role', header: 'Rol' },
    { field: 'active', header: 'Activo', type: 'boolean' }
  ];

  constructor(
    private miServicio: ServUsersApi,
    private authService: AuthService,
    private formbuilder: FormBuilder
  ) {
    this.loadUsers();

    this.formUser = this.formbuilder.group({
      name: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(50), Validators.pattern(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, Validators.pattern(/^\+?[0-9]{7,15}$/)]],
      role: ['', Validators.required],
      active: [true]
    });

    this.currentUserId = Number(this.authService.getUserId());

  }

  @ViewChild("userModalRef") modalElement!: ElementRef;

  ngAfterViewInit() {
    this.modalRef = new bootstrap.Modal(this.modalElement.nativeElement);
  }

  loadUsers() {
    this.miServicio.getUsers().subscribe((data: User[]) => {
      this.users = data;
      this.filteredUsers = [...data];
    });
  }

  delete(user: User) {
    if (user.id === this.currentUserId) {
      Swal.fire({
        icon: 'warning',
        title: 'Acción no permitida',
        text: 'No puedes eliminar tu propio usuario'
      });
      return;
    }
    Swal.fire({
      title: '¿Seguro deseas eliminar el usuario?',
      text: user.name,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (result.isConfirmed && user.id) {
        this.miServicio.delete(user.id).subscribe({
          next: () => {
            Swal.fire({
              icon: 'success',
              title: 'Usuario eliminado',
              showConfirmButton: false,
              timer: 1500
            });
            this.loadUsers();
          },
          error: () => {
            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: 'No se pudo eliminar el usuario'
            });
          }
        });
      }
    });
  }

  search(filters: any) {
    this.miServicio.search(filters).subscribe(
      (data: User[]) => {
        this.filteredUsers = data;
      }
    );
  }

  openNew() {
    this.editingId = null;
    this.formUser.reset({ active: true });
    
    if (!this.editingId) {
      this.formUser.get('role')?.enable();
    }

    this.modalRef.show();
  }

  openEdit(user: User) {
    if (user.id === this.currentUserId) {
      Swal.fire({
        icon: 'warning',
        title: 'Acción no permitida',
        text: 'No puedes editar tu propio usuario desde aquí'
      });
      return;
    }

    this.editingId = user.id!;
    this.formUser.patchValue(user);
    this.formUser.get('role')?.disable();
    this.modalRef.show();
  }

  resetPassword() {
    if (!this.editingId) return;

    Swal.fire({
      title: '¿Reiniciar contraseña?',
      text: 'Se generará una nueva contraseña para este usuario.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, reiniciar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (!result.isConfirmed) return;

      this.miServicio.resetPassword(Number(this.editingId)).subscribe({
        next: (res: any) => {
          Swal.fire({
            icon: 'success',
            title: 'Contraseña reiniciada',
            html: `
              <p><strong>Nueva contraseña:</strong></p>
              <code style="font-size:16px">${res.temporaryPassword}</code>
              <p class="mt-2 text-muted">Compártela con el usuario.</p>
            `,
            confirmButtonText: 'Aceptar'
          });
        },
        error: (err) => {
          let errorMsg = 'Error al reiniciar la contraseña';

          if (err.error) {
            if (typeof err.error === 'string') {
              errorMsg = err.error;
            }
            else if (err.error.message) {
              errorMsg = err.error.message;
            }
            else if (err.error.errors) {
              errorMsg = Object.values(err.error.errors)
                .flat()
                .join(', ');
            }
          }

          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: errorMsg
          });
        }
      });
    });
  }

  save() {
    if (this.formUser.invalid) {
      this.formUser.markAllAsTouched();
      return;
    }

    let datos = this.formUser.value;

    if (this.editingId) {
      let user: User = { ...datos, id: this.editingId };

      if (!user.password) {
        delete user.password;
      }

      this.miServicio.update(user).subscribe({
        next: () => {
          Swal.fire({
            icon: 'success',
            title: '¡Éxito!',
            text: 'Usuario actualizado correctamente'
          });
          this.modalRef.hide();
          this.loadUsers();
        },
        error: (err) => {
          let errorMsg = 'Error al actualizar el usuario';
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
    } else {
      let user: User = { ...datos };
      this.miServicio.create(user).subscribe({
        next: () => {
          Swal.fire({
            icon: 'success',
            title: '¡Éxito!',
            text: 'Usuario creado correctamente'
          });
          this.modalRef.hide();
          this.loadUsers();
        },
        error: (err) => {
          let errorMsg = 'Error al crear el usuario';
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
  }
  
}