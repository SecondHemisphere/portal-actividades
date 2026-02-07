import { Component, EventEmitter, Input, Output } from '@angular/core';
import { PaginationControls } from '../pagination-control/pagination-control';
import { DatePipe } from '@angular/common';

/** Define la estructura de cada columna */
export interface TableColumn {
  field: string; // nombre del campo
  header: string; // título de la columna
  type?: string; // tipo especial (number, longtext, boolean, etc)
  lookup?: (value: any) => string; // función para mostrar nombre en vez de ID
}

@Component({
  selector: 'app-data-table',
  templateUrl: './data-table.html',
  styleUrl: './data-table.css',
  imports: [PaginationControls, DatePipe]
})
export class DataTable {

  @Input() colArray!: TableColumn[]; // columnas que se mostrarán en la tabla
  @Input() gridData: any[] = []; // datos completos que se renderizan en la tabla

  @Input() showView: boolean = true; // mostrar u ocultar botón de ver
  @Input() showEdit: boolean = true; // mostrar u ocultar botón de editar
  @Input() showDelete: boolean = true; // mostrar u ocultar botón de eliminar

  @Output() onView = new EventEmitter<any>(); // evento para ver el elemento seleccionado
  @Output() onEdit = new EventEmitter<any>(); // evento para editar el elemento seleccionado
  @Output() onDelete = new EventEmitter<any>(); // evento para eliminar el elemento seleccionado

  pagedData: any[] = []; // registros visibles en la tabla según la página actual
  sortedData: any[] = []; // registros visibles en la tabla ordenados

  currentPage = 1; // página actual
  totalPages = 1; // total de páginas calculadas

  sortField = ''; // campo por el cual se está ordenando
  sortDirection: 'asc' | 'desc' = 'asc'; // dirección del ordenamiento

  selectedText = ''; // texto seleccionado para mostrar en el modal
  showModal = false; // controla si el modal está visible
  modalTitle = 'Detalle'; // título del modal para texto largo

  ngOnChanges() {
    this.sortedData = [...this.gridData];
    this.applySorting();
  }

  /** Ordena tabla */
  sort(field: string) {
    if (this.sortField === field) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortField = field;
      this.sortDirection = 'asc';
    }

    this.applySorting();
  }

  /** Aplica ordenamiento */
  private applySorting() {
    if (!this.sortField) return;

    this.sortedData = [...this.sortedData].sort((a, b) => {
      const valueA = a[this.sortField];
      const valueB = b[this.sortField];

      if (valueA < valueB) return this.sortDirection === 'asc' ? -1 : 1;
      if (valueA > valueB) return this.sortDirection === 'asc' ? 1 : -1;

      return 0;
    });
  }

  /** Actualiza los datos mostrados según la página seleccionada */
  handlePagedData(data: any[]) {
    this.pagedData = data;
  }
  
  /** Guarda el número de la página actual */
  handlePageChange(page: number) {
    this.currentPage = page;
  }
  
  /** Guarda cuántas páginas existen en total */
  handleTotalPages(total: number) {
    this.totalPages = total;
  }

  /** Acción del botón Ver */
  view(row: any) {
    this.onView.emit(row);
  }

  /** Acción del botón Editar */
  edit(row: any) {
    this.onEdit.emit(row);
  }

  /** Acción del botón Eliminar */
  delete(row: any) {
    this.onDelete.emit(row);
  }

  /** Abre el modal que permite visualizar texto largo */
  openModal(text: string) {
    this.selectedText = text;
    this.showModal = true;
  }

  /** Cierra el modal que permite visualizar texto largo */
  closeModal() {
    this.showModal = false;
  }
}
