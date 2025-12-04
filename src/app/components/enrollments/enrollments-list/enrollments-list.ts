import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PaginationControls } from '../../shared/pagination-control/pagination-control';
import { Enrollment } from '../../../models/Enrollment';
import { Activity } from '../../../models/Activity';
import { ServEnrollmentsJson } from '../../../services/serv-enrollments-json';
import { ServActivitiesJson } from '../../../services/serv-activities-json';
import { ActivityCard } from '../../activities/activity-card/activity-card';
import { Category } from '../../../models/Category';
import { Organizer } from '../../../models/Organizer';
import { ServCategoriesJson } from '../../../services/serv-categories-json';
import { ServOrganizersJson } from '../../../services/serv-organizers-json';

@Component({
  selector: 'app-enrollments-list',
  templateUrl: './enrollments-list.html',
  styleUrl: './enrollments-list.css',
  imports: [CommonModule, PaginationControls, ActivityCard],
})
export class EnrollmentsList {
  enrollments: Enrollment[] = [];
  filteredEnrollments: Enrollment[] = [];
  pagedData: Enrollment[] = [];

  activities: Activity[] = [];
  categories: Category[] = [];
  organizers: Organizer[] = [];

  studentId = 1;

  currentPage = 1;
  totalPages = 1;

  constructor(
    private enrollmentsService: ServEnrollmentsJson,
    private activitiesService: ServActivitiesJson,
    private categoriesService: ServCategoriesJson,
    private organizersService: ServOrganizersJson,
  ) {
    this.loadEnrollments();
    this.loadActivities();
    this.loadCategories();
    this.loadOrganizers();
  }

  loadEnrollments() {
    this.enrollmentsService.getEnrollmentsByStudent(this.studentId).subscribe((data: Enrollment[]) => {
      this.enrollments = data;
      this.filteredEnrollments = [...data];
    });
  }

  loadActivities() {
    this.activitiesService.getActivities().subscribe((data: Activity[]) => {
      this.activities = data;
    });
  }

  loadCategories() {
    this.categoriesService.getCategories().subscribe((data: Category[]) => {
      this.categories = data;
    });
  }

  loadOrganizers() {
    this.organizersService.getOrganizers().subscribe((data: Organizer[]) => {
      this.organizers = data;
    });
  }

  /** Helpers para ActivityCard */
  getActivity(activityId: number): Activity | undefined {
    return this.activities.find(a => a.id === activityId);
  }

  getActivityCategory(activity: Activity): Category[] {
    if (!activity) return [];
    const category = this.categories.find(c => c.id === activity.categoryId);
    return category ? [category] : [];
  }

  getActivityOrganizer(activity: Activity): Organizer[] {
    if (!activity) return [];
    const organizer = this.organizers.find(o => o.id === activity.organizerId);
    return organizer ? [organizer] : [];
  }

  /** Eventos desde ActivityCard */
  handleEnroll(activity: Activity) {
    alert(`Inscribirse en: ${activity.title}`);
    // Aquí podrías llamar a tu servicio de inscripciones
  }

  handleCancel(activity: Activity) {
    const enrollment = this.enrollments.find(e => e.activityId === activity.id);
    if (!enrollment) return;
    if (confirm('¿Deseas cancelar tu inscripción?')) {
      this.enrollmentsService.cancelEnrollment(enrollment.id!).subscribe(() => {
        alert('Inscripción cancelada');
        this.loadEnrollments();
      });
    }
  }

  handleView(activity: Activity) {
    alert(`Ver detalles de: ${activity.title}`);
    // Aquí abrirías el modal o página de detalles
  }

  /** Paginación */
  handlePagedData(data: Enrollment[]) {
    this.pagedData = data;
  }

  handlePageChange(page: number) {
    this.currentPage = page;
  }

  handleTotalPages(total: number) {
    this.totalPages = total;
  }
}
