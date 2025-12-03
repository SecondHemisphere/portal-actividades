import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-pagination-controls',
  templateUrl: './pagination-control.html',
  styleUrls: ['./pagination-control.css'],
  imports: []
})
export class PaginationControls {
  @Input() totalData: any[] = []; // todos los datos que se van a paginar
  @Input() pageSizeOptions: number[] = [5, 10, 20, 50]; // opciones de cantidad de registros por página

  @Output() pagedDataChange = new EventEmitter<any[]>(); // evento para envíar los datos que se deben mostrar
  @Output() onPageChange = new EventEmitter<number>(); // evento para avisar en qué página estamos
  @Output() onTotalPagesChange = new EventEmitter<number>(); // evento para avisar cuántas páginas existen en total

  currentPage = 1; // página actual
  pageSize = 5 // cuántos registros se muestran por página
  totalPages = 1; // total de páginas disponibles
  pagedDataLength = 0; // cuántos datos tiene la página actual

  ngOnChanges() {
    this.updatePagination();
  }

  /** Cambia de página */
  goToPage(page: number) {
    if (page < 1 || page > this.totalPages) return;

    this.currentPage = page;
    this.onPageChange.emit(this.currentPage);
    this.updatePagination();
  }

  /** Cambia a la siguiente página */
  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.goToPage(this.currentPage + 1);
    }
  }

  /** Cambia a la página anterior */
  prevPage() {
    if (this.currentPage > 1) {
      this.goToPage(this.currentPage - 1);
    }
  }

  /** Cambia cuántos registros se quieren ver por página */
  changePageSize(event: any) {
    this.pageSize = +(event.target.value);
    this.currentPage = 1;
    this.updatePagination();
  }

  /** Actualiza la cantidad de páginas y los datos que se muestran en la página actual */
  private updatePagination() {
    if (!this.totalData) return;

    this.totalPages = Math.ceil(this.totalData.length / this.pageSize);
    this.onTotalPagesChange.emit(this.totalPages);

    const start = (this.currentPage - 1) * this.pageSize;
    const end = start + this.pageSize;

    const paged = this.totalData.slice(start, end);

    this.pagedDataLength = paged.length;
    this.pagedDataChange.emit(paged);
  }

  /** Genera los números de página que se mostrarán alrededor de la actual */
  get pagesToShow(): number[] {
    const pages: number[] = [];
    const start = Math.max(1, this.currentPage - 2);
    const end = Math.min(this.totalPages, this.currentPage + 2);

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    return pages;
  }
}
