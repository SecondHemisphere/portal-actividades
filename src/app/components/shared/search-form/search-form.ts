import { Component, ElementRef, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';

declare const bootstrap:any;

/** Define los filtros disponibles en el buscador */
export interface SearchFilter {
  type: 'text' | 'select' | 'date' | 'number' ;
  field: string; // nombre del campo
  label: string; // texto visible
  options?: any[]; // opciones para select
  placeholder?: string; // texto de ayuda
}

@Component({
  selector: 'app-search-form',
  imports: [ReactiveFormsModule],
  templateUrl: './search-form.html',
  styleUrl: './search-form.css',
})
export class SearchForm {

  @Input() filters: SearchFilter[] = []; // lista de filtros

  @Output() onSearch = new EventEmitter<any>(); // evento cuando se busca

  filterForm: FormGroup = new FormGroup<Record<string, FormControl>>({}); // formulario
  modalRef: any; // referencia al modal

  ngOnInit() {
    this.filters.forEach(f => {
      this.filterForm.addControl(f.field, new FormControl(''));
    });
  }

  @ViewChild("searchModalRef") modalElement!:ElementRef;
  ngAfterViewInit() {
    if (this.modalElement) {
      this.modalRef = new bootstrap.Modal(this.modalElement.nativeElement);
    }
  }

  /** Abrir modal */
  openModal() {
    if (this.modalRef) {
      this.modalRef.show();
    }
  }

  /** Cerrar modal */
  closeModal() {
    if (this.modalRef) {
      this.modalRef.hide();
    }
  }

  /** Obtiene un filtro específico */
  getControl(field: string): FormControl {
    return this.filterForm.get(field)! as FormControl;
  }

  /** Acción del botón Buscar */
  search() {
    const filters = this.filterForm.value;
    this.closeModal();
    this.onSearch.emit(filters);
  }

  /** Limpia todos los campos */
  clear() {
    Object.keys(this.filterForm.controls).forEach(key => {
      this.filterForm.get(key)?.setValue('');
    });
  }

}
