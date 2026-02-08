import { Component, ElementRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Student, Career, Faculty, Modality, Schedule } from '../../../models/Student';
import { User } from '../../../models/User';
import { AuthService } from '../../../services/auth.service';
import { ServStudentsApi } from '../../../services/serv-students-api';
import { ServDropdownsApi } from '../../../services/serv-dropdowns-api';
import { ApiErrorService } from '../../../shared/api-error.service';
import { UiAlertService } from '../../../shared/ui-alert.service';

declare const bootstrap: any;

@Component({
  selector: 'app-student-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './student-profile.html',
  styleUrls: ['./student-profile.css']
})
export class StudentProfile {

  student!: Student;
  user!: User;

  formStudent!: FormGroup;
  modalRef: any;

  faculties: Faculty[] = [];
  allCareers: Career[] = [];
  careers: Career[] = [];

  modalities = Object.values(Modality);
  schedules = Object.values(Schedule);

  photoPreview: string | null = null;
  studentEdit: Student = {} as Student;

  @ViewChild('studentModalRef') modalElement!: ElementRef;

  constructor(
    private fb: FormBuilder,
    private studentService: ServStudentsApi,
    private dropDownsService: ServDropdownsApi,
    private authService: AuthService,
    private apiError: ApiErrorService,
    private ui: UiAlertService
  ) {
    this.formStudent = this.fb.group({});
  }

  ngOnInit() {
    const userId = this.authService.getUserId();
    if (!userId) return;

    this.dropDownsService.getFacultiesWithCareers().subscribe({
      next: facs => {
        this.faculties = facs;
        this.allCareers = facs.flatMap(f =>
          (f.careers ?? []).map(c => ({ ...c, facultyId: f.id }))
        );

        this.studentService.getStudentById(Number(userId)).subscribe({
          next: st => {
            this.student = st;
            this.photoPreview = st.photoUrl || null;
            this.initForm();
          },
          error: err => this.apiError.handle(err, 'cargar perfil de estudiante')
        });
      },
      error: err => this.apiError.handle(err, 'cargar facultades y carreras')
    });
  }

  ngAfterViewInit() {
    this.modalRef = new bootstrap.Modal(this.modalElement.nativeElement);
  }

  initForm() {
    this.formStudent = this.fb.group({
      name: [this.student.name, [Validators.required, Validators.minLength(3)]],
      email: [this.student.email, [Validators.required, Validators.email]],
      phone: [this.student.phone, [Validators.required, Validators.pattern(/^\+?[0-9]{7,15}$/)]],
      facultyId: [this.student.facultyId, Validators.required],
      careerId: [this.student.careerId, Validators.required],
      semester: [this.student.semester, [Validators.required, Validators.min(1), Validators.max(10)]],
      modality: [this.student.modality, Validators.required],
      schedule: [this.student.schedule, Validators.required],
      photoUrl: [this.student.photoUrl || '']
    });

    this.careers = this.allCareers.filter(c => c.facultyId === this.student.facultyId);

    this.formStudent.get('facultyId')?.valueChanges.subscribe(facId => {
      this.careers = this.allCareers.filter(c => c.facultyId === Number(facId));
      const currentCareerId = this.formStudent.get('careerId')?.value;
      const careerStillValid = this.careers.some(c => c.id === currentCareerId);

      if (!careerStillValid) {
        this.formStudent.get('careerId')?.setValue(null);
      }
    });
  }

  openEditProfile(student: Student) {
    this.studentEdit = student;

    this.formStudent.patchValue({
      facultyId: student.facultyId,
      careerId: student.careerId,
      name: student.name,
      email: student.email,
      phone: student.phone,
      semester: student.semester,
      modality: student.modality,
      schedule: student.schedule,
      photoUrl: student.photoUrl
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

    const datos = this.formStudent.value;
    const payload: Student = { ...this.student, ...datos };

    this.ui.confirm('¿Deseas actualizar tu perfil?', 'Se actualizarán tus datos del perfil.').then(result => {
      if (!result.isConfirmed) return;

      this.studentService.update(payload).subscribe({
        next: () => {
          const userId = this.authService.getUserId();
          if (!userId) return;

          this.studentService.getStudentById(Number(userId)).subscribe({
            next: st => {
              this.student = st;
              this.photoPreview = st.photoUrl || null;
              this.ui.success('¡Perfil actualizado!');
              this.modalRef.hide();
            },
            error: err => this.apiError.handle(err, 'refrescar perfil de estudiante')
          });
        },
        error: err => this.apiError.handle(err, 'actualizar perfil de estudiante')
      });
    });
  }

}
