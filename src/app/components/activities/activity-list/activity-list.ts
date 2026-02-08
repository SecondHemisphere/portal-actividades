import { Component } from '@angular/core';
import { SearchFilter, SearchForm } from '../../shared/search-form/search-form';
import { Activity } from '../../../models/Activity';
import { Category } from '../../../models/Category';
import { Organizer } from '../../../models/Organizer';
import { CommonModule } from '@angular/common';
import { PaginationControls } from '../../shared/pagination-control/pagination-control';
import { ActivityCard } from '../activity-card/activity-card';
import { ServActivitiesApi } from '../../../services/serv-activities-api';
import { ServCategoriesApi } from '../../../services/serv-categories-api';
import { ServOrganizersApi } from '../../../services/serv-organizers-api';

const PATTERN = [
  'col-lg-4', 'col-lg-4', 'col-lg-4',
  'col-lg-6', 'col-lg-6',
  'col-lg-4', 'col-lg-4', 'col-lg-4',
  'col-lg-6', 'col-lg-6'
];

@Component({
  selector: 'app-activity-list',
  imports: [SearchForm, CommonModule, PaginationControls, ActivityCard],
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
    private activitiesService: ServActivitiesApi,
    private categoriesService: ServCategoriesApi,
    private organizersService: ServOrganizersApi,
  ) {
    this.loadActivities();
    this.loadCategories();
    this.loadOrganizers();
  }
 
  loadActivities() {
    this.activitiesService.getActiveActivities().subscribe((data: Activity[]) => {
      this.activities = data;
      this.filteredActivities = [...data];
      this.pagedData = this.buildRows(this.filteredActivities);
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

  search(filters: any) {
    this.activitiesService.searchPublic(filters).subscribe(
      (data: Activity[]) => {
        this.filteredActivities = data;
        this.currentPage = 1;
        this.totalPages = 1;
        this.pagedData = this.buildRows(this.filteredActivities);
      }
    );
  }

  buildRows(data: any[]) {
    const result: any[] = [];
    let index = 0;

    while (index < data.length) {
      const remaining = data.length - index;

      const possiblePatterns = [];
      if (remaining >= 4) possiblePatterns.push(4);
      if (remaining >= 3) possiblePatterns.push(3);

      if (remaining === 2) possiblePatterns.push(2);
      if (remaining === 1) possiblePatterns.push(1);

      const selected = possiblePatterns[Math.floor(Math.random() * possiblePatterns.length)];

      let colClass = '';
      if (selected === 4) colClass = 'col-lg-3';
      if (selected === 3) colClass = 'col-lg-4';
      if (selected === 2) colClass = 'col-lg-6';
      if (selected === 1) colClass = 'col-lg-12';

      const rowItems = data.slice(index, index + selected).map(item => {
        return { ...item, widthClass: colClass };
      });

      result.push(...rowItems);

      index += selected;
    }

    return result;
  }

  /** Actualiza los datos mostrados según la página seleccionada */
  handlePagedData(data: any[]) {
    this.pagedData = this.buildRows(data);
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
