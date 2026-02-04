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
import Swal from 'sweetalert2';

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
    private studentsService: ServStudentsApi
  ) {
    this.formEnrollment = this.fb.group({
      activityId: ['', Validators.required],
      studentId: ['', Validators.required],
      enrollmentDate: [''],
      note: ['', [Validators.minLength(5), Validators.maxLength(300)]],
      status: [EnrollmentStatus.Inscrito, Validators.required]
    });

    this.loadActivities();
    this.loadStudents();
    this.loadEnrollments();
  }

  ngAfterViewInit() {
    this.modalRef = new bootstrap.Modal(this.modalElement.nativeElement);
  }

  private mapEnrollment(e: Enrollment): Enrollment & { activityName: string; studentName: string } {
    const activity = this.activities.find(a => a.id === e.activityId);
    return {
      ...e,
      activityName: e.activity?.title ?? e.activityName ?? '',
      studentName: e.student?.name ?? e.studentName ?? ''
    };
  }

  loadEnrollments() {
    this.enrollmentService.getEnrollments2().subscribe(data => {
      this.enrollments = data.map(e => this.mapEnrollment(e));
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
          Swal.fire('Actualizado', 'Inscripción actualizada correctamente', 'success');
          this.modalRef.hide();
          this.loadEnrollments();
        },
        error: (err) => {
          console.error(err);
          Swal.fire('Error', 'No se pudo actualizar la inscripción', 'error');
        }
      });
    } else {
      this.enrollmentService.create(datos).subscribe({
        next: () => {
          Swal.fire('Creado', 'Inscripción creada correctamente', 'success');
          this.modalRef.hide();
          this.loadEnrollments();
        },
        error: (err) => {
          const errorMsg = err.error?.message ?? 'Ocurrió un error al buscar calificaciones';
          console.error(err);
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: errorMsg
          });
        }
      });
    }
  }

  delete(enrollment: Enrollment) {
    Swal.fire({
      title: '¿Deseas eliminar la inscripción?',
      text: `Actividad: ${enrollment.activityName}, Estudiante: ${enrollment.studentName}`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then(result => {
      if (result.isConfirmed) {
        this.enrollmentService.delete(enrollment.id!).subscribe(() => {
          Swal.fire('Eliminado', 'Inscripción eliminada', 'success');
          this.loadEnrollments();
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
        this.filteredEnrollments = data.map(e => this.mapEnrollment(e));
      },
      error: (err) => {
        const errorMsg = err.error?.message ?? 'Ocurrió un error al buscar inscripciones';
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: errorMsg
        });
      }
    });
  }
}
