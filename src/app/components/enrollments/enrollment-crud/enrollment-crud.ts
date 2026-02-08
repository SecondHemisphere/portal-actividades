import { Component, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, FormsModule, Validators } from '@angular/forms';
import { SearchFilter, SearchForm } from '../../shared/search-form/search-form';
import { DataTable, TableColumn } from '../../shared/data-table/data-table';
import { Enrollment, EnrollmentStatus } from '../../../models/Enrollment';
import { Activity } from '../../../models/Activity';
import { Student } from '../../../models/Student';
import { ServStudentsApi } from '../../../services/serv-students-api';
import { ServActivitiesApi } from '../../../services/serv-activities-api';
import { ServEnrollmentsApi } from '../../../services/serv-enrollments-api';
import { ApiErrorService } from '../../../shared/api-error.service';
import { UiAlertService } from '../../../shared/ui-alert.service';

declare const bootstrap: any;

@Component({
  selector: 'app-enrollment-crud',
  standalone: true,
  imports: [ReactiveFormsModule, FormsModule, DataTable, SearchForm],
  templateUrl: './enrollment-crud.html',
  styleUrls: ['./enrollment-crud.css']
})
export class EnrollmentCrud implements AfterViewInit {
  enrollments: Enrollment[] = [];
  filteredEnrollments: Enrollment[] = [];
  formEnrollment!: FormGroup;
  editingId: number | null = null;
  modalRef: any;

  activities: Activity[] = [];
  students: Student[] = [];
  enrollmentStatuses = Object.values(EnrollmentStatus);

  minDate: string = "2020-01-01";
  maxDate: string = new Date().toISOString().split("T")[0];
  maxEnrollmentDate: string = this.maxDate;

  enrollmentFilters: SearchFilter[] = [
    { type: 'select', field: 'activityId', label: 'Actividad', options: [] },
    { type: 'select', field: 'studentId', label: 'Estudiante', options: [] },
    { type: 'select', field: 'status', label: 'Estado', options: this.enrollmentStatuses.map(s => ({ label: s, value: s })) },
    { type: 'date', field: 'fromDate', label: 'Fecha desde' },
    { type: 'date', field: 'toDate', label: 'Fecha hasta' }
  ];

  colArray: TableColumn[] = [
    { field: 'id', header: 'ID', type: 'number' },
    { field: 'activityName', header: 'Actividad' },
    { field: 'studentName', header: 'Estudiante' },
    { field: 'enrollmentDate', header: 'Fecha', type: 'date' },
    { field: 'note', header: 'Observaciones', type: 'longtext' },
    { field: 'status', header: 'Estado' }
  ];

  @ViewChild('enrollmentModalRef') modalElement!: ElementRef;

  constructor(
    private fb: FormBuilder,
    private enrollmentService: ServEnrollmentsApi,
    private activitiesService: ServActivitiesApi,
    private studentsService: ServStudentsApi,
    private apiError: ApiErrorService,
    private ui: UiAlertService
  ) {
    this.formEnrollment = this.fb.group({
      activityId: ['', Validators.required],
      studentId: ['', Validators.required],
      enrollmentDate: [''],
      note: ['', [Validators.maxLength(300)]],
      status: [EnrollmentStatus.Inscrito, Validators.required]
    });

    this.loadActivities();
    this.loadStudents();
    this.loadEnrollments();
  }

  ngAfterViewInit() {
    this.modalRef = new bootstrap.Modal(this.modalElement.nativeElement);
  }

  loadEnrollments() {
    this.enrollmentService.getEnrollments2().subscribe(data => {
      this.enrollments = data;
      this.filteredEnrollments = [...this.enrollments];
    });
  }

  loadActivities() {
    this.activitiesService.getActivities2().subscribe(data => {
      this.activities = data;
      const activityFilter = this.enrollmentFilters.find(f => f.field === 'activityId');
      if (activityFilter) {
        activityFilter.options = data.map(a => ({ label: a.title, value: a.id }));
      }
    });
  }

  loadStudents() {
    this.studentsService.getStudents2().subscribe(data => {
      this.students = data;
      const studentFilter = this.enrollmentFilters.find(f => f.field === 'studentId');
      if (studentFilter) {
        studentFilter.options = data.map(s => ({ label: s.name, value: s.id }));
      }
    });
  }

  openNew() {
    this.editingId = null;

    if (!this.editingId) {
      this.formEnrollment.get('activityId')?.enable();
      this.formEnrollment.get('studentId')?.enable();
      this.formEnrollment.get('enrollmentDate')?.enable();
    }

    this.formEnrollment.reset({
      activityId: '',
      studentId: '',
      enrollmentDate: '',
      note: '',
      status: EnrollmentStatus.Inscrito
    });
    this.modalRef.show();
  }

  openEdit(enrollment: Enrollment) {
    this.editingId = enrollment.id ?? null;

    if (this.editingId) {
      this.formEnrollment.get('activityId')?.disable();
      this.formEnrollment.get('studentId')?.disable();
    }

    this.formEnrollment.patchValue({
      activityId: enrollment.activityId,
      studentId: enrollment.studentId,
      enrollmentDate: enrollment.enrollmentDate,
      note: enrollment.note,
      status: enrollment.status
    });

    this.modalRef.show();
  }

  save() {
    if (this.formEnrollment.invalid) {
      this.formEnrollment.markAllAsTouched();
      return;
    }

    const datos: Enrollment = this.formEnrollment.value;

    if (this.editingId) {
      datos.id = this.editingId;
      this.enrollmentService.update(datos).subscribe({
        next: () => {
          this.ui.success('Inscripción actualizada correctamente');
          this.modalRef.hide();
          this.loadEnrollments();
        },
        error: (err) => {
          this.apiError.handle(err, 'actualizar');
        }
      });
    } else {
      this.enrollmentService.create(datos).subscribe({
        next: () => {
          this.ui.success('Inscripción creada correctamente');
          this.modalRef.hide();
          this.loadEnrollments();
        },
        error: (err) => {
          this.apiError.handle(err, 'crear');
        }
      });
    }
  }

  delete(enrollment: Enrollment) {
    this.ui.confirm(
      '¿Eliminar la inscripción',
      `Actividad: ${enrollment.activityName}, Estudiante: ${enrollment.studentName}`,
      'Sí, eliminar'
    ).then(result => {
      if (result.isConfirmed) {
        this.enrollmentService.delete(Number(enrollment.id)).subscribe({
          next: () => {
            this.ui.success('Inscripción eliminada');
            this.loadEnrollments();
          },
          error: (err) => {
            this.apiError.handle(err, 'eliminar la inscripción');
          }
        });
      }
    });
  }

  search(filters: {
    studentId?: number;
    activityId?: number;
    status?: string;
    fromDate?: string;
    toDate?: string;
  }) {
    this.enrollmentService.search(filters).subscribe({
      next: (data: Enrollment[]) => {
        this.filteredEnrollments = data;
      },
      error: (err) => {
        this.apiError.handle(err, 'buscar');
      }
    });
  }
  
}
