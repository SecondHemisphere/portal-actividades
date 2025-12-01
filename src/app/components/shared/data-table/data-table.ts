import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';

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
  imports: [ReactiveFormsModule]
})
export class DataTable {

  @Input() colArray!: TableColumn[]; // columnas que se mostrarán en la tabla
  @Input() gridData: any[] = []; // datos completos que se renderizan en la tabla

  @Input() showView: boolean = true; // mostrar u ocultar botón de ver
  @Input() showEdit: boolean = true; // mostrar u ocultar botón de editar
  @Input() showDelete: boolean = true; // mostrar u ocultar botón de eliminar

  @Output() onView = new EventEmitter<any>(); // evento para ver el elemento seleccionado
  @Output() onEdit = new EventEmitter<any>(); // evento para editar el elemento seleccionado
  @Output() onDelete = new EventEmitter<any>(); // evento para eliminar el elemento seleccionad0

  currentPage = 1; // página actual
  pageSize = 10 ; // cantidad de registros por página
  pageSizes = [5, 10, 20, 25, 50]; // opciones de cantidad de registros
  pageSizeControl = new FormControl(this.pageSize); // control para seleccionar cantidad de registros

  totalPages = 1; // total de páginas calculadas
  pagedData: any[] = []; // registros visibles en la tabla según la página actual
  pages: number[] = []; // arreglo con el número de páginas para mostrar botones

  sortField = ''; // campo por el cual se está ordenando
  sortDirection: 'asc' | 'desc' = 'asc'; // dirección del ordenamiento

  selectedText = ''; // texto seleccionado para mostrar en el modal
  showModal = false; // controla si el modal está visible
  modalTitle = 'Detalle'; // título del modal para texto largo

  constructor() {
    this.pageSizeControl.valueChanges.subscribe(value => {
      this.pageSize = value ?? 10;
      this.currentPage = 1;
      this.updatePagination();
    });
  }

  ngOnChanges() {
    this.applySorting();
    this.updatePagination();
  }

  /** Actualiza la cantidad de registros por página */
  onPageSizeChange() {
    this.currentPage = 1;
    this.updatePagination();
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
    this.updatePagination();
  }

  /** Aplica ordenamiento */
  private applySorting() {
    if (!this.sortField) return;

    this.gridData = [...this.gridData].sort((a, b) => {
      const valueA = a[this.sortField];
      const valueB = b[this.sortField];

      if (valueA < valueB) return this.sortDirection === 'asc' ? -1 : 1;
      if (valueA > valueB) return this.sortDirection === 'asc' ? 1 : -1;

      return 0;
    });
  }

  /** Actualiza paginación */
  updatePagination() {
    this.totalPages = Math.ceil(this.gridData.length / this.pageSize);
    this.pages = Array.from({ length: this.totalPages }, (_, i) => i + 1);
    this.updatePagedData();
  }

  /** Genera la página actual */
  updatePagedData() {
    const start = (this.currentPage - 1) * this.pageSize;
    const end = start + this.pageSize;
    this.pagedData = this.gridData.slice(start, end);
  }

  /** Dirige a una página */
  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.updatePagedData();
    }
  }

  /** Dirige a la página anterior */
  prevPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.updatePagedData();
    }
  }

  /** Dirige a la página siguiente */
  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.updatePagedData();
    }
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
