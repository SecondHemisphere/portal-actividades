import { Component, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { SearchFilter, SearchForm } from '../../shared/search-form/search-form';
import { DataTable, TableColumn } from '../../shared/data-table/data-table';
import { Career, Faculty, Modality, Schedule, Student } from '../../../models/Student';
import { ServStudentsApi } from '../../../services/serv-students-api';
import { ServDropdownsApi } from '../../../services/serv-dropdowns-api';
import { UserRole } from '../../../models/User';
import Swal from 'sweetalert2';

declare const bootstrap: any;

@Component({
  selector: 'app-student-crud',
  imports: [ReactiveFormsModule, DataTable, SearchForm, FormsModule],
  templateUrl: './student-crud.html',
  styleUrls: ['./student-crud.css'],
})
export class StudentCrud implements AfterViewInit {
  students: Student[] = [];
  filteredStudents: Student[] = [];
  formStudent!: FormGroup;
  editingId: number | null = null;
  modalRef: any;

  faculties: Faculty[] = [];
  allCareers: Career[] = [];
  careers: Career[] = [];

  modalities = Object.values(Modality);
  schedules = Object.values(Schedule);

  photoPreview: string | null = null;
  studentEdit: Student = {} as Student;

  studentFilters: SearchFilter[] = [
    { type: 'text', field: 'name', label: 'Nombre' },
    { type: 'select', field: 'facultyId', label: 'Facultad', options: [] },
    { type: 'select', field: 'careerId', label: 'Carrera', options: [] },
    { type: 'number', field: 'semester', label: 'Semestre' },
    {
      type: 'select',
      field: 'modality',
      label: 'Modalidad',
      options: Object.values(Modality).map(v => ({ label: v, value: v }))
    },
    {
      type: 'select',
      field: 'schedule',
      label: 'Jornada',
      options: Object.values(Schedule).map(v => ({ label: v, value: v }))
    }
  ];

  colArray: TableColumn[] = [
    { field: 'id', header: 'ID', type: 'number' },
    { field: 'name', header: 'Nombre' },
    { field: 'facultyName', header: 'Facultad' },
    { field: 'careerName', header: 'Carrera' },
    { field: 'semester', header: 'Semestre', type: 'number' },
    { field: 'modality', header: 'Modalidad' },
    { field: 'schedule', header: 'Jornada' },
    { field: 'email', header: 'Correo' },
    { field: 'phone', header: 'Teléfono' },
    { field: 'active', header: 'Activo', type: 'boolean' }
  ];

  constructor(
    private studentService: ServStudentsApi,
    private dropDownsService: ServDropdownsApi,
    private fb: FormBuilder
  ) {
    this.loadStudents();

    this.formStudent = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(50), Validators.pattern(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)]],
      email: ['', [Validators.required, Validators.email]],
      facultyId: ['', Validators.required],
      careerId: ['', Validators.required],
      semester: [1, [Validators.required, Validators.min(1), Validators.max(10)]],
      modality: ['', Validators.required],
      schedule: ['', Validators.required],
      phone: ['', [Validators.required, Validators.pattern(/^\+?[0-9]{7,15}$/)]],
      photoUrl: [''],
      active: [true]
    });

    this.dropDownsService.getFacultiesWithCareers().subscribe(faculties => {
      this.faculties = faculties;

      this.allCareers = faculties.flatMap(f =>
        (f.careers ?? []).map(c => ({ ...c, facultyId: f.id }))
      );

      const facultyFilter = this.studentFilters.find(f => f.field === 'facultyId');
      if (facultyFilter) {
        facultyFilter.options = faculties.map(f => ({
          label: f.name,
          value: f.id
        }));
      }

      const careerFilter = this.studentFilters.find(f => f.field === 'careerId');
      if (careerFilter) {
        careerFilter.options = this.allCareers.map(c => ({
          label: c.name,
          value: c.id
        }));
      }
    });

    this.formStudent.get('facultyId')?.valueChanges.subscribe(facId => {
      this.careers = this.allCareers.filter(c => c.facultyId === Number(facId));
      this.formStudent.get('careerId')?.setValue(null);
    });
  }

  @ViewChild("studentModalRef") modalElement!: ElementRef;
  ngAfterViewInit() {
    this.modalRef = new bootstrap.Modal(this.modalElement.nativeElement);
  }

  loadStudents() {
    this.studentService.getStudents2().subscribe((data: Student[]) => {
      this.students = data.map(s => ({
        ...s,
        facultyName: s.faculty?.name || s.facultyName,
        careerName: s.career?.name || s.careerName
      }));
      this.filteredStudents = [...this.students];
    });
  }

  openNew() {
    this.editingId = null;
    this.formStudent.reset({
      name: '',
      email: 'example@uni.edu',
      facultyId: '',
      careerId: '',
      semester: 1,
      modality: '',
      schedule: '',
      phone: '',
      photoUrl: '',
      active: true
    });
    this.photoPreview = null;
    this.modalRef.show();
  }

  openEdit(student: Student) {
    this.studentEdit = student;
    this.editingId = student.id || null;

    this.formStudent.patchValue({
      name: student.name,
      email: student.email,
      phone: student.phone,
      photoUrl: student.photoUrl,
      semester: student.semester,
      modality: student.modality,
      schedule: student.schedule,
      active: student.active,
      facultyId: student.facultyId,
      careerId: student.careerId
    });

    this.photoPreview = student.photoUrl || null;
    this.modalRef.show();
  }

  updatePhotoPreview() {
    const url = this.formStudent.get('photoUrl')?.value;
    this.photoPreview = url && url.trim() !== '' ? url : null;
  }

  save() {
    if (this.formStudent.invalid) {
      this.formStudent.markAllAsTouched();
      return;
    }

    const fv = this.formStudent.value;

    const student: Student = {
      id: this.editingId ?? 0,
      name: fv.name,
      email: fv.email,
      phone: fv.phone,
      photoUrl: fv.photoUrl,
      careerId: Number(fv.careerId),
      semester: Number(fv.semester),
      modality: fv.modality,
      schedule: fv.schedule,
      role: UserRole.Estudiante,
      active: fv.active ?? true
    };

    if (this.editingId) {
      this.studentService.update(student).subscribe({
        next: (res: any) => {
          Swal.fire({
            icon: 'success',
            title: '¡Éxito!',
            text: res?.message ?? 'Estudiante actualizado correctamente'
          });
          this.modalRef.hide();
          this.loadStudents();
        },
        error: (err) => {
          let errorMsg = 'Error al actualizar el estudiante';
          if (err.error) {
            if (err.error.name) errorMsg = err.error.name.join(', ');
            if (err.error.email) errorMsg = err.error.email.join(', ');
          }
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: errorMsg
          });
          console.error(err);
        }
      });

    } else {
      this.studentService.create(student).subscribe({
        next: (res: any) => {
          Swal.fire({
            icon: 'success',
            title: '¡Éxito!',
            text: res?.message ?? 'Estudiante creado correctamente'
          });
          this.modalRef.hide();
          this.loadStudents();
        },
        error: (err) => {
          let errorMsg = 'Error al crear el estudiante';
          if (err.error) {
            if (err.error.name) errorMsg = err.error.name.join(', ');
            if (err.error.email) errorMsg = err.error.email.join(', ');
          }
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: errorMsg
          });
          console.error(err);
        }
      });
    }
  }

  delete(student: Student) {
    Swal.fire({
      title: '¿Seguro deseas eliminar el estudiante?',
      text: student.name,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (result.isConfirmed) {
        this.studentService.deactivate(Number(student.id)).subscribe({
          next: () => {
            Swal.fire({
              icon: 'success',
              title: 'Estudiante eliminado',
              showConfirmButton: false,
              timer: 1500
            });
            this.loadStudents();
          },
          error: (err) => {
            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: 'No se pudo eliminar el estudiante.',
            });
            console.error(err);
          }
        });
      }
    });
  }

  search(filters: any) {
    this.studentService.search(filters).subscribe(
      (data: Student[]) => {
        this.filteredStudents = data.map(s => this.mapStudent(s));
      }
    );
  }

  private mapStudent(s: Student): Student {
    return {
      ...s,
      facultyName: s.faculty?.name ?? s.facultyName ?? '',
      careerName: s.career?.name ?? s.careerName ?? ''
    };
  }

}
