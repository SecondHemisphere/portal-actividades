import { Component, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { SearchFilter, SearchForm } from '../../shared/search-form/search-form';
import { DataTable, TableColumn } from '../../shared/data-table/data-table';
import { Rating } from '../../../models/Rating';
import { ServRatingsApi } from '../../../services/serv-ratings-api';
import { ServStudentsApi } from '../../../services/serv-students-api';
import { ServActivitiesApi } from '../../../services/serv-activities-api';
import Swal from 'sweetalert2';
import { Student } from '../../../models/Student';
import { Activity } from '../../../models/Activity';

declare const bootstrap: any;

@Component({
  selector: 'app-rating-crud',
  standalone: true,
  imports: [ReactiveFormsModule, DataTable, SearchForm],
  templateUrl: './rating-crud.html',
  styleUrl: './rating-crud.css',
})
export class RatingCrud {

  ratings: Rating[] = [];
  filteredRatings: Rating[] = [];

  students: Student[] = [];
  activities: Activity[] = [];

  modalRef: any;

  ratingFilters: SearchFilter[] = [
    { type: 'select', field: 'activityId', label: 'Actividad', options: [] },
    { type: 'select', field: 'studentId', label: 'Estudiante', options: [] },
    { type: 'number', field: 'stars', label: 'Puntuación' },
    { type: 'date', field: 'fromDate', label: 'Fecha desde' },
    { type: 'date', field: 'toDate', label: 'Fecha hasta' }
  ];

  colArray: TableColumn[] = [
    { field: 'id', header: 'ID', type: 'number' },
    { field: 'activityName', header: 'Actividad' },
    { field: 'studentName', header: 'Estudiante' },
    { field: 'stars', header: 'Puntuación', type: 'number' },
    { field: 'comment', header: 'Comentario', type: 'longtext' },
    { field: 'ratingDate', header: 'Fecha', type: 'date' },
  ];

  constructor(
    private ratingService: ServRatingsApi,
    private studentsService: ServStudentsApi,
    private activitiesService: ServActivitiesApi
  ) {
    this.loadStudents();
    this.loadActivities();
    this.loadRatings();
  }

  private mapRating(r: Rating): Rating {
    return {
      ...r,
      studentName: r.studentName,
      activityName: r.activityName,
    };
  }

  loadRatings() {
    this.ratingService.getRatings2().subscribe((data: Rating[]) => {
      this.ratings = data.map(r => this.mapRating(r));
      this.filteredRatings = [...this.ratings];
    });
  }

  loadStudents() {
    this.studentsService.getStudents2().subscribe((data: Student[]) => {
      this.students = data;

      const filter = this.ratingFilters.find(f => f.field === 'studentId');
      if (filter) {
        filter.options = data.map(s => ({
          label: s.name,
          value: s.id
        }));
      }
    });
  }

  loadActivities() {
    this.activitiesService.getActivities2().subscribe((data: Activity[]) => {
      this.activities = data;

      const filter = this.ratingFilters.find(f => f.field === 'activityId');
      if (filter) {
        filter.options = data.map(a => ({
          label: a.title,
          value: a.id
        }));
      }
    });
  }

  delete(rating: Rating) {
    Swal.fire({
      title: '¿Seguro deseas eliminar esta calificación?',
      text: `${rating.studentName} - ${rating.activityName}`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then(result => {
      if (result.isConfirmed) {
        this.ratingService.delete(Number(rating.id)).subscribe({
          next: () => {
            Swal.fire({
              icon: 'success',
              title: 'Calificación eliminada',
              timer: 1500,
              showConfirmButton: false
            });
            this.loadRatings();
          },
          error: () => {
            Swal.fire('Error', 'No se pudo eliminar la calificación', 'error');
          }
        });
      }
    });
  }

  search(filters: {
    activityId?: number;
    studentId?: number;
    stars?: number;
    fromDate?: string;
    toDate?: string;
  }) {
    this.ratingService.search(filters).subscribe({
      next: (data: Rating[]) => {
        this.filteredRatings = data.map(r => this.mapRating(r));
      },
      error: (err) => {
        const errorMsg = err.error?.message ?? 'Ocurrió un error al buscar calificaciones';
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: errorMsg
        });
      }
    });
  }

}
