import { Component, ElementRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { SearchFilter, SearchForm } from '../../shared/search-form/search-form';
import { DataTable, TableColumn } from '../../shared/data-table/data-table';
import { Rating } from '../../../models/Rating';
import { ServRatingsJson } from '../../../services/serv-ratings-json';
import { Student } from '../../../models/Student';
import { Activity } from '../../../models/Activity';
import { ServStudentsApi } from '../../../services/serv-students-api';
import { ServActivitiesApi } from '../../../services/serv-activities-api';

declare const bootstrap: any;

@Component({
  selector: 'app-rating-crud',
  imports: [ReactiveFormsModule, DataTable, SearchForm],
  templateUrl: './rating-crud.html',
  styleUrl: './rating-crud.css',
})
export class RatingCrud {
  ratings: Rating[] = [];
  filteredRatings: Rating[] = [];
  formRating!: FormGroup;
  editingId: number | null = null;
  modalRef: any;

  minDate: string = '2020-01-01';
  maxDate = new Date().toISOString().split('T')[0];

  students: Student[] = [];
  activities: Activity[] = [];

  ratingFilters: SearchFilter[] = [
    { type: 'select', field: 'activityId', label: 'Actividad', options: [] },
    { type: 'select', field: 'studentId', label: 'Estudiante', options: [] },
    { type: 'number', field: 'stars', label: 'Puntuación' },
    { type: 'date', field: 'date', label: 'Fecha' },
    { type: 'text', field: 'comment', label: 'Comentario' },
  ];

  colArray: TableColumn[] = [
    { field: 'id', header: 'ID', type: 'number' },
    { field: 'activityId', header: 'Actividad', type: 'lookup', lookup: (id: number) => this.getActivityTitle(id) },
    { field: 'studentId', header: 'Estudiante', type: 'lookup', lookup: (id: number) => this.getStudentName(id) },
    { field: 'stars', header: 'Puntuación', type: 'number' },
    { field: 'comment', header: 'Comentario', type: 'longtext' },
    { field: 'date', header: 'Fecha', type: 'date' },
  ];

  constructor(
    private miServicio: ServRatingsJson,
    private studentsService: ServStudentsApi,
    private activitiesService: ServActivitiesApi,
    private formbuilder: FormBuilder
  ) {
    this.loadStudents();
    this.loadActivities();
    this.loadRatings();

    this.formRating = this.formbuilder.group({
      activityId: ['', Validators.required],
      studentId: ['', Validators.required],
      stars: ['', [Validators.required, Validators.min(1), Validators.max(5)]],
      comment: ['', [Validators.maxLength(250)]],
      date: ['', Validators.required],
    });
  }

  @ViewChild('ratingModalRef') modalElement!: ElementRef;
  ngAfterViewInit() {
    this.modalRef = new bootstrap.Modal(this.modalElement.nativeElement);
  }

  loadRatings() {
    this.miServicio.getRatings().subscribe((data: Rating[]) => {
      this.ratings = data;
      this.filteredRatings = [...data];
    });
  }

  loadStudents() {
    this.studentsService.getStudents().subscribe((data: Student[]) => {
      this.students = data;
      const studentFilter = this.ratingFilters.find(f => f.field === 'studentId');
      if (studentFilter) {
        studentFilter.options = this.students.map(s => ({ label: s.name, value: s.id }));
      }
    });
  }
  
  loadActivities() {
    this.activitiesService.getActivities().subscribe((data: Activity[]) => {
      this.activities = data;
      const activityFilter = this.ratingFilters.find(f => f.field === 'activityId');
      if (activityFilter) {
        activityFilter.options = this.activities.map(a => ({ label: a.title, value: a.id }));
      }
    });
  }

  getStudentName(id: number): string {
    return this.students.find(s => Number(s.id) === Number(id))?.name || 'Estudiante Desconocido';
  }

  getActivityTitle(id: number): string {
    return this.activities.find(a => Number(a.id) === Number(id))?.title || 'Actividad Desconocida';
  }

  delete(rating: Rating) {
    const confirmado = confirm(`¿Seguro deseas eliminar la calificación ${rating.id} de ${this.getStudentName(rating.studentId)} para la actividad ${this.getActivityTitle(rating.activityId)}?`
    );
    if (confirmado) {
      this.miServicio.delete(rating.id).subscribe(() => {
        alert('Calificación eliminada');
        this.loadRatings();
      });
    }
  }

  search(filters: any) {
    this.miServicio.searchRatings(filters).subscribe(
      (data: Rating[]) => {
        this.filteredRatings = data;
      }
    );
  }

  openNew() {
    this.editingId = null;
    this.formRating.reset({
      activityId: '',
      studentId: '',
      stars: 5,
      comment: '',
      date: this.maxDate,
    });
    this.modalRef.show();
  }

  openEdit(rating: Rating) {
    this.editingId = rating.id ?? null;

    this.formRating.patchValue({
      ...rating,
    });

    this.modalRef.show();
  }

  save() {
    if (this.formRating.invalid) {
      this.formRating.markAllAsTouched();
      return;
    }

    const datos: Rating = this.formRating.value;

    if (this.editingId) {
      let rating: Rating = { ...datos, id: this.editingId };
      this.miServicio.update(rating).subscribe(() => {
        alert('Calificación actualizada');
        this.modalRef.hide();
        this.loadRatings();
      });
    } else {
      let rating: Rating = { ...datos };
      this.miServicio.create(rating).subscribe(() => {
        alert('Calificación creada');
        this.modalRef.hide();
        this.loadRatings();
      });
    }
  }
}