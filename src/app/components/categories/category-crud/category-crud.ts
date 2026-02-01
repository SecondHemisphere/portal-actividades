import { Component, ElementRef, ViewChild } from '@angular/core';
import { Category } from '../../../models/Category';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { SearchFilter, SearchForm } from '../../shared/search-form/search-form';
import { DataTable, TableColumn } from '../../shared/data-table/data-table';
import { ServCategoriesApi } from '../../../services/serv-categories-api';
import Swal from 'sweetalert2';

declare const bootstrap:any;

@Component({
  selector: 'app-category-crud',
  imports: [ReactiveFormsModule, DataTable, SearchForm],
  templateUrl: './category-crud.html',
  styleUrl: './category-crud.css',
})
export class CategoryCrud {
  categories: Category[] = [];
  filteredCategories: Category[] = [];
  formCategory!: FormGroup;
  editingId: number | null = null;
  modalRef: any;

  categoryFilters: SearchFilter[] = [
    { type: 'text', field: 'name', label: 'Nombre' },
  ];

  colArray: TableColumn[] = [
    { field: 'id', header: 'ID', type: 'number' },
    { field: 'name', header: 'Nombre' },
    { field: 'active', header: 'Activo', type: 'boolean' }
  ];

  constructor(
    private miServicio: ServCategoriesApi,
    private formbuilder: FormBuilder
  ) {
    this.loadCategories();
    this.formCategory = this.formbuilder.group({
      name: ['', [Validators.required,Validators.minLength(3),Validators.maxLength(50),Validators.pattern(/^[a-zA-Z0-9 áéíóúÁÉÍÓÚñÑ]+$/)]],
      active: [true]
    });
  }

  @ViewChild("categoryModalRef") modalElement!: ElementRef;
  ngAfterViewInit() {
    this.modalRef = new bootstrap.Modal(this.modalElement.nativeElement);
  }

  loadCategories() {
    this.miServicio.getCategories().subscribe((data: Category[]) => {
      this.categories = data;
      this.filteredCategories = [...data];
    });
  }

  delete(category: Category) {
    Swal.fire({
      title: `¿Seguro deseas eliminar la categoría?`,
      text: category.name,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (result.isConfirmed) {
        this.miServicio.delete(Number(category.id)).subscribe({
          next: () => {
            Swal.fire({
              icon: 'success',
              title: 'Categoría eliminada',
              showConfirmButton: false,
              timer: 1500
            });
            this.loadCategories();
          },
          error: (err) => {
            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: 'No se pudo eliminar la categoría.',
            });
            console.error(err);
          }
        });
      }
    });
  }

  search(filters: any) {
    this.miServicio.search(filters).subscribe(
      (data: Category[]) => {
        this.filteredCategories = data;
      }
    );
  }

  openNew() {
    this.editingId = null;
    this.formCategory.reset({
      name: '',
      active: true
    });
    this.modalRef.show();
  }

  openEdit(category: Category) {
    this.editingId = category.id ? category.id : null;
    this.formCategory.patchValue(category);
    this.modalRef.show();
  }

  save() {
    if (this.formCategory.invalid) {
      this.formCategory.markAllAsTouched();
      return;
    }

    let datos = this.formCategory.value;

    if (this.editingId) {
      let category: Category = { ...datos, id: this.editingId };
      this.miServicio.update(category).subscribe({
        next: (res: any) => {
          Swal.fire({icon: 'success', title: '¡Éxito!', text: res.message});
          this.modalRef.hide();
          this.loadCategories();
        },
        error: (err) => {
          let errorMsg = 'Error al actualizar la categoría';
          if (err.error?.name) errorMsg = err.error.name.join(', ');
          Swal.fire({ icon: 'error', title: 'Error', text: errorMsg });
        }
      });
    } else {
      let category: Category = { ...datos };
      this.miServicio.create(category).subscribe({
        next: (res: any) => {
          Swal.fire({icon: 'success', title: '¡Éxito!', text: res.message});
          this.modalRef.hide();
          this.loadCategories();
        },
        error: (err) => {
          let errorMsg = 'Error al crear la categoría';
          if (err.error) {
            if (err.error.name) errorMsg = err.error.name.join(', ');
          }
          Swal.fire({icon: 'error', title: 'Error', text: errorMsg});
        }
      });
    }
  }

}
