import { Component, ElementRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { SearchFilter, SearchForm } from '../../shared/search-form/search-form';
import { DataTable, TableColumn } from '../../shared/data-table/data-table';
import { Enrollment, EnrollmentStatus } from '../../../models/Enrollment';
import { ServEnrollmentsJson } from '../../../services/serv-enrollments-json';
import { Activity } from '../../../models/Activity';
import { Student } from '../../../models/Student';
import { ServActivitiesJson } from '../../../services/serv-activities-json';
import { ServStudentsJson } from '../../../services/serv-students-json';

declare const bootstrap: any;

@Component({
  selector: 'app-enrollment-crud',
  imports: [ReactiveFormsModule, DataTable, SearchForm],
  templateUrl: './enrollment-crud.html',
  styleUrl: './enrollment-crud.css'
})
export class EnrollmentCrud {
  enrollments: Enrollment[] = [];
  filteredEnrollments: Enrollment[] = [];
  formEnrollment!: FormGroup;
  editingId: number | null = null;
  modalRef: any;

  minDate:string = "2020-01-01";
  maxDate = new Date().toISOString().split("T")[0]; ///fecha con formato yyyy-mm-dd
  maxEnrollmentDate: string = this.maxDate;

  activities: Activity[] = [];
  students: Student[] = [];
  
  enrollmentStatuses = Object.values(EnrollmentStatus);
  
  enrollmentFilters: SearchFilter[] = [
    { type: 'select', field: 'activityId', label: 'Actividad', options: [] },
    { type: 'select', field: 'studentId', label: 'Estudiante', options: [] },
    { type: 'select', field: 'status', label: 'Estado', options: Object.values(EnrollmentStatus).map(s => ({ label: s, value: s })) },
    { type: 'date', field: 'date', label: 'Fecha' }
  ];

  colArray: TableColumn[] = [
    { field: 'id', header: 'ID', type: 'number' },
    { field: 'activityId', header: 'Actividad', type: 'lookup', lookup: (id: number) => this.getActivityName(id) },
    { field: 'studentId', header: 'Estudiante', type: 'lookup', lookup: (id: number) => this.getStudentName(id) },
    { field: 'date', header: 'Fecha', type: 'date' },
    { field: 'note', header: 'Observaciones', type: 'longtext' },
    { field: 'status', header: 'Estado' }
  ];

  constructor(
    private enrollmentService: ServEnrollmentsJson,
    private activitiesService: ServActivitiesJson,
    private studentsService: ServStudentsJson,
    private formBuilder: FormBuilder
  ) {
    this.loadEnrollments();
    this.loadActivities();
    this.loadStudents();

    this.formEnrollment = this.formBuilder.group({
      activityId: ['', Validators.required],
      studentId: ['', Validators.required],
      date: ['', Validators.required],
      note: ['', [Validators.minLength(5), Validators.maxLength(300)]],
      status: [EnrollmentStatus.Inscrito, Validators.required]
    });
  }

  @ViewChild('enrollmentModalRef') modalElement!: ElementRef;

  ngAfterViewInit() {
    this.modalRef = new bootstrap.Modal(this.modalElement.nativeElement);
  }

  ngOnInit() {
    this.formEnrollment.get('activityId')?.valueChanges.subscribe((activityId: number) => {
      const selectedActivity = this.activities.find(a => a.id === activityId);
      if (selectedActivity) {
        const activityDate = new Date(selectedActivity.date);
        activityDate.setDate(activityDate.getDate() - 1);
        this.maxEnrollmentDate = activityDate.toISOString().split('T')[0];

        const currentDate = this.formEnrollment.get('date')?.value;
        if (currentDate && currentDate > this.maxEnrollmentDate) {
          this.formEnrollment.get('date')?.setValue(this.maxEnrollmentDate);
        }
      } else {
        this.maxEnrollmentDate = this.maxDate;
      }
    });
  }

  loadEnrollments() {
    this.enrollmentService.getEnrollments().subscribe((data: Enrollment[]) => {
      this.enrollments = data;
      this.filteredEnrollments = [...data];
    });
  }

  loadActivities() {
    this.activitiesService.getActivities().subscribe((data: Activity[]) => {
      this.activities = data;
      const activityFilter = this.enrollmentFilters.find(f => f.field === 'activityId');
      if (activityFilter) {
        activityFilter.options = data.map(a => ({ label: a.title, value: a.id }));
      }
    });
  }

  loadStudents() {
    this.studentsService.getStudents().subscribe((data: Student[]) => {
      this.students = data;
      const studentFilter = this.enrollmentFilters.find(f => f.field === 'studentId');
      if (studentFilter) {
        studentFilter.options = data.map(s => ({ label: s.name, value: s.id }));
      }
    });
  }

  getActivityName(id: number): string {
    return this.activities.find(a => a.id === id)?.title || 'Sin actividad';
  }

  getStudentName(id: number): string {
    return this.students.find(s => s.id === id)?.name || 'Sin estudiante';
  }

  delete(enrollment: Enrollment) {
    if (confirm(`¿Seguro deseas eliminar la inscripción?`)) {
      this.enrollmentService.delete(enrollment.id!).subscribe(() => {
        alert('Inscripción eliminada');
        this.loadEnrollments();
      });
    }
  }

  search(filters: any) {
    this.enrollmentService.searchEnrollments(filters).subscribe((data: Enrollment[]) => {
      this.filteredEnrollments = data;
    });
  }

  openNew() {
    this.editingId = null;
    this.formEnrollment.reset({
      activityId: '',
      studentId: '',
      date: '',
      note: '',
      status: EnrollmentStatus.Inscrito
    });
    this.modalRef.show();
  }

  openEdit(enrollment: Enrollment) {
    this.editingId = enrollment.id ?? null;
    this.formEnrollment.patchValue({ ...enrollment });
    this.modalRef.show();
  }

  save() {
    if (this.formEnrollment.invalid) {
      this.formEnrollment.markAllAsTouched();
      return;
    }

    let datos: Enrollment = this.formEnrollment.value;

    if (this.editingId) {
      datos.id = this.editingId;
      this.enrollmentService.update(datos).subscribe(() => {
        alert('Inscripción actualizada');
        this.modalRef.hide();
        this.loadEnrollments();
      });
    } else {
      this.enrollmentService.create(datos).subscribe(() => {
        alert('Inscripción creada');
        this.modalRef.hide();
        this.loadEnrollments();
      });
    }
  }
}
