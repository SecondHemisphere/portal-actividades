import { Component, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { SearchFilter, SearchForm } from '../../shared/search-form/search-form';
import { DataTable, TableColumn } from '../../shared/data-table/data-table';
import { User, UserRole } from '../../../models/User';
import { ServUsersJson } from '../../../services/serv-users-json';

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

  userFilters: SearchFilter[] = [
    { type: 'text', field: 'name', label: 'Nombre' },
    { type: 'text', field: 'email', label: 'Correo' },
    {
      type: 'select',
      field: 'role',
      label: 'Rol',
      options: this.userRoles.map(v => ({ label: v, value: v }))
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
    private miServicio: ServUsersJson,
    private formbuilder: FormBuilder
  ) {
    this.loadUsers();

    this.formUser = this.formbuilder.group({
      name: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(50), Validators.pattern(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, Validators.pattern(/^\+?[0-9]{7,15}$/)]],
      password: [''],
      role: ['', Validators.required],
      active: [true]
    });
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
    const confirmado = confirm(`¿Estás seguro de eliminar el usuario: ${user.name}?`);
    if (confirmado && user.id) {
      this.miServicio.delete(user.id).subscribe(() => {
        alert("Usuario eliminado exitosamente");
        this.loadUsers();
      });
    }
  }

  search(filters: any) {
    this.miServicio.searchUsers(filters).subscribe(
      (data: User[]) => {
        this.filteredUsers = data;
      }
    );
  }

  openNew() {
    this.editingId = null;
    this.formUser.reset({ active: true, password: '' });

    this.formUser.get('password')?.setValidators(Validators.required);
    this.formUser.get('password')?.updateValueAndValidity();

    this.modalRef.show();
  }

  openEdit(user: User) {
    this.editingId = user.id ? user.id : null;

    this.formUser.get('password')?.clearValidators();
    this.formUser.get('password')?.updateValueAndValidity();

    this.formUser.patchValue(user);
    this.modalRef.show();
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

      this.miServicio.update(user).subscribe(() => {
        alert("Usuario actualizado");
        this.modalRef.hide();
        this.loadUsers();
      });
    } else {
      let user: User = { ...datos };
      this.miServicio.create(user).subscribe(() => {
        alert("Usuario creado");
        this.modalRef.hide();
        this.loadUsers();
      });
    }
  }
}