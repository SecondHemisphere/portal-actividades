import { Component, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { SearchFilter, SearchForm } from '../../../shared/search-form/search-form';
import { DataTable, TableColumn } from '../../../shared/data-table/data-table';
import { User, UserRole } from '../../../../models/User';
import { ServUsersApi } from '../../../../services/serv-users-api';
import { AuthService } from '../../../../services/auth.service';
import { UiAlertService } from '../../../../shared/ui-alert.service';
import { ApiErrorService } from '../../../../shared/api-error.service';

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
    private formbuilder: FormBuilder,
    private apiError: ApiErrorService,
    private ui: UiAlertService
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
      this.ui.warning('No puedes eliminar tu propio usuario');
      return;
    }

    this.ui.deleteConfirm(user.name)
      .then(result => {
        if (result.isConfirmed && user.id) {
          this.miServicio.delete(user.id).subscribe({
            next: () => {
              this.ui.success('Usuario eliminado correctamente');
              this.loadUsers();
            },
            error: (err) => {
              this.apiError.handle(err, 'eliminar el usuario');
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
      this.ui.warning('No puedes editar tu propio usuario desde aquí');
      return;
    }
    this.editingId = user.id!;
    this.formUser.patchValue(user);
    this.formUser.get('role')?.disable();
    this.modalRef.show();
  }

  resetPassword() {
    if (!this.editingId) return;

    this.ui.confirm(
      '¿Reiniciar contraseña?',
      'Se generará una nueva contraseña para este usuario.'
    ).then(result => {
      if (!result.isConfirmed) return;

      this.miServicio.resetPassword(this.editingId!).subscribe({
        next: (res: any) => {
          this.ui.success(
            `Contraseña reiniciada. La nueva contraseña de este usuario es "${res.temporaryPassword}"`
          );
        },
        error: (err) => {
          this.apiError.handle(err, 'reiniciar la contraseña');
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
          this.ui.success('Usuario actualizado correctamente');
          this.modalRef.hide();
          this.loadUsers();
        },
        error: (err) => {
          this.apiError.handle(err, 'actualizar el usuario');
        }
      });
    } else {
      let user: User = { ...datos };
      this.miServicio.create(user).subscribe({
        next: () => {
          this.ui.success('Usuario creado correctamente');
          this.modalRef.hide();
          this.loadUsers();
        },
        error: (err) => {
          this.apiError.handle(err, 'crear el usuario');
        }
      });
    }
  }
  
}