import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-pagination-controls',
  templateUrl: './pagination-control.html',
  styleUrls: ['./pagination-control.css'],
})
export class PaginationControls {
  @Input() totalData: any[] = [];
  @Input() initialPageSize: number = 10;

  @Output() pagedDataChange = new EventEmitter<any[]>();
  @Output() onPageChange = new EventEmitter<number>();
  @Output() onTotalPagesChange = new EventEmitter<number>();

  currentPage = 1;
  pageSize = 10;
  totalPages = 1;
  pagedDataLength = 0;

  ngOnChanges() {
    this.pageSize = this.initialPageSize;
    this.updatePagination();
  }

  /** Cambia de página */
  goToPage(page: number) {
    if (page < 1 || page > this.totalPages) return;

    this.currentPage = page;
    this.onPageChange.emit(this.currentPage);
    this.updatePagination();
  }

  /** Siguiente página */
  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.goToPage(this.currentPage + 1);
    }
  }

  /** Página anterior */
  prevPage() {
    if (this.currentPage > 1) {
      this.goToPage(this.currentPage - 1);
    }
  }

  /** Cambia tamaño de página */
  changePageSize(event: any) {
    this.pageSize = +(event.target.value);
    this.currentPage = 1;
    this.updatePagination();
  }

  /** Total y datos paginados */
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

  /** Crear rango dinámico para las 5 páginas (actual ± 2) */
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
