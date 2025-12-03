import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Activity } from '../../../models/Activity';
import { Category } from '../../../models/Category';
import { Organizer } from '../../../models/Organizer';
import { Enrollment, EnrollmentStatus } from '../../../models/Enrollment';

import { ServActivitiesJson } from '../../../services/serv-activities-json';
import { ServCategoriesJson } from '../../../services/serv-categories-json';
import { ServOrganizersJson } from '../../../services/serv-organizers-json';
import { ServEnrollmentsJson } from '../../../services/serv-enrollments-json';

import { ActivityCard } from '../../activities/activity-card/activity-card';
import { SearchFilter, SearchForm } from '../../shared/search-form/search-form';
import { PaginationControls } from '../../shared/pagination-control/pagination-control';

@Component({
  selector: 'app-student-catalog',
  imports: [
    CommonModule,
    FormsModule,
    ActivityCard,
    SearchForm,
    PaginationControls
  ],
  templateUrl: './student-catalog.html',
  styleUrl: './student-catalog.css',
})
export class StudentCatalog implements OnInit {

  allActivities: Activity[] = [];
  filteredActivities: Activity[] = [];
  pagedData: Activity[] = []; // <-- datos que se muestran en la página actual

  categories: Category[] = [];
  organizers: Organizer[] = [];
  allEnrollments: Enrollment[] = [];

  currentStudentId: number = 101;

  activityFilters: SearchFilter[] = [
    { type: 'text', field: 'title', label: 'Buscar por título' },
    { type: 'select', field: 'categoryId', label: 'Categoría', options: [] },
    { type: 'date', field: 'date', label: 'Fecha' },
  ];

  constructor(
    private activityService: ServActivitiesJson,
    private categoriesService: ServCategoriesJson,
    private organizersService: ServOrganizersJson,
    private enrollmentService: ServEnrollmentsJson
  ) {}

  ngOnInit(): void {
    this.loadInitialData();
  }

  loadInitialData(): void {
    this.categoriesService.getCategories().subscribe((data: Category[]) => {
      this.categories = data.filter(c => c.active);

      const categoryFilter = this.activityFilters.find(f => f.field === 'categoryId');
      if (categoryFilter) {
        categoryFilter.options = this.categories.map(c => ({
          label: c.name,
          value: c.id,
        }));
      }
    });

    this.organizersService.getOrganizers().subscribe((data: Organizer[]) => {
      this.organizers = data;
    });

    this.enrollmentService.getEnrollments().subscribe((data: Enrollment[]) => {
      this.allEnrollments = data;

      this.activityService.getActivities().subscribe((data: Activity[]) => {
        this.allActivities = data.filter(a => a.active);
        this.filteredActivities = [...this.allActivities];
      });
    });
  }

  searchActivities(filters: any) {
    this.activityService.searchActivities(filters).subscribe(
      (data: Activity[]) => {
        this.filteredActivities = data.filter(a => a.active);
      }
    );
  }

  /** Recibe los datos correspondientes a la página actual */
  updatePagedData(data: Activity[]) {
    this.pagedData = data;
  }

  getAvailableCapacity(activity: Activity): number {
    const confirmedEnrollments = this.allEnrollments.filter(
      e =>
        e.activityId === activity.id &&
        e.status === EnrollmentStatus.Confirmada
    ).length;

    return activity.capacity - confirmedEnrollments;
  }

  enrollInActivity(activityId: number) {
    const existingEnrollment = this.allEnrollments.find(
      e =>
        e.activityId === activityId &&
        e.studentId === this.currentStudentId &&
        e.status !== EnrollmentStatus.Cancelada
    );

    if (existingEnrollment) {
      alert(
        `Ya estás inscrito con estado: ${existingEnrollment.status}. Revisa Mis Inscripciones.`
      );
      return;
    }

    const newEnrollment: Enrollment = {
      activityId,
      studentId: this.currentStudentId,
      date: new Date().toISOString().split('T')[0],
      status: EnrollmentStatus.Pendiente,
    };

    this.enrollmentService.create(newEnrollment).subscribe({
      next: () => {
        alert(
          '¡Solicitud de inscripción enviada! Estado: PENDIENTE. Revisa Mis Inscripciones.'
        );
        this.loadInitialData();
      },
      error: () => {
        alert('Error al intentar inscribirse. Por favor, inténtalo de nuevo.');
      },
    });
  }
}
