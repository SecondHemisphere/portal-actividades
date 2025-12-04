import { Component } from '@angular/core';
import { SearchFilter, SearchForm } from '../../shared/search-form/search-form';
import { Activity } from '../../../models/Activity';
import { ServActivitiesJson } from '../../../services/serv-activities-json';
import { Category } from '../../../models/Category';
import { Organizer } from '../../../models/Organizer';
import { ServCategoriesJson } from '../../../services/serv-categories-json';
import { ServOrganizersJson } from '../../../services/serv-organizers-json';
import { CommonModule } from '@angular/common';
import { PaginationControls } from '../../shared/pagination-control/pagination-control';

@Component({
  selector: 'app-activity-list',
  imports: [SearchForm, CommonModule, PaginationControls],
  templateUrl: './activity-list.html',
  styleUrl: './activity-list.css',
})
export class ActivityList {
  activities: Activity[] = [];
  filteredActivities: Activity[] = [];

  categories: Category[] = [];
  organizers: Organizer[] = [];

  availableCapacity = 0;

  pagedData: any[] = []; // registros visibles en la lista según la página actual

  currentPage = 1; // página actual
  totalPages = 1; // total de páginas calculadas

  activityFilters: SearchFilter[] = [
    { type: 'text', field: 'title', label: 'Título' },
    { type: 'select', field: 'categoryId', label: 'Categoría', options: [] },
  ];

  constructor(
    private activitiesService: ServActivitiesJson,
    private categoriesService: ServCategoriesJson,
    private organizersService: ServOrganizersJson,
  ) {
    this.loadActivities();
    this.loadCategories();
    this.loadOrganizers();
  }

  loadActivities() {
    this.activitiesService.getActivities().subscribe((data: Activity[]) => {
      this.activities = data;
      this.filteredActivities = [...data];
    });
  }

  loadCategories() {
    this.categoriesService.getCategories().subscribe((data: Category[]) => {
      this.categories = data;
      const categoryFilter = this.activityFilters.find(f => f.field === 'categoryId');
      if (categoryFilter) {
        categoryFilter.options = this.categories.map(c => ({ label: c.name, value: c.id }));
      }
    });
  }

  loadOrganizers() {
    this.organizersService.getOrganizers().subscribe((data: Organizer[]) => {
      this.organizers = data;
      const organizerFilter = this.activityFilters.find(f => f.field === 'organizerId');
      if (organizerFilter) {
        organizerFilter.options = this.organizers.map(o => ({ label: o.name, value: o.id }));
      }
    });
  }

  getCategoryName(id: number): string {
    return this.categories.find(c => Number(c.id) === Number(id))?.name || 'Sin categoría';
  }

  getOrganizerName(id: number): string {
    return this.organizers.find(o => Number(o.id) === Number(id))?.name || 'Sin organizador';
  }

  getAvailableCapacity(activity: Activity): number {
    return activity.capacity; // temporal
  }

  search(filters: any) {
    this.activitiesService.searchActivities(filters).subscribe(
      (data: Activity[]) => {
        this.filteredActivities = data;
      }
    );
  }

  /** Acción del botón Inscribirse */
  enrollClicked(activity: Activity) {
    alert(`Te has inscrito a: ${activity.title}`);
  }

  /** Verifica si la fecha límite de inscripción ha pasado */
  isRegistrationClosed(activity: Activity): boolean {
    const deadline = new Date(activity.registrationDeadline);
    const today = new Date();
    return deadline < today;
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

}
