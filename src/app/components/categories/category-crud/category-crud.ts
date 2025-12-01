import { Component, ElementRef, ViewChild } from '@angular/core';
import { Category } from '../../../models/Category';
import { ServCategoriesJson } from '../../../services/serv-categories-json';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { SearchFilter, SearchForm } from '../../shared/search-form/search-form';
import { DataTable, TableColumn } from '../../shared/data-table/data-table';

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
    private miServicio: ServCategoriesJson,
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
    const confirmado = confirm(`¿Estás seguro de eliminar la categoría? ${category.name}`);
    if (confirmado) {
      this.miServicio.delete(category.id).subscribe(() => {
        alert("Eliminada exitosamente");
        this.loadCategories();
      });
    }
  }

  search(filters: any) {
    this.miServicio.searchCategories(filters).subscribe(
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
      this.miServicio.update(category).subscribe(() => {
        alert("Categoría actualizada");
        this.modalRef.hide();
        this.loadCategories();
      });
    } else {
      let category: Category = { ...datos };
      this.miServicio.create(category).subscribe(() => {
        alert("Categoría creada");
        this.modalRef.hide();
        this.loadCategories();
      });
    }
  }
}
