import { Component, ElementRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { Student, Career, Faculty, Modality, Schedule } from '../../../models/Student';
import { ServProfileApi } from '../../../services/serv-profile-api';
import { ServDropdownsApi } from '../../../services/serv-dropdowns-api';
import { ApiErrorService } from '../../../shared/api-error.service';
import { UiAlertService } from '../../../shared/ui-alert.service';

declare const bootstrap: any;

@Component({
  selector: 'app-student-profile',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './student-profile.html',
  styleUrl: './student-profile.css'
})
export class StudentProfile {

  student!: Student;
  formStudent: FormGroup;
  modalRef: any;

  faculties: Faculty[] = [];
  allCareers: Career[] = [];
  careers: Career[] = [];

  modalities = Object.values(Modality);
  schedules = Object.values(Schedule);

  photoPreview: string | null = null;

  @ViewChild('studentModalRef') modalElement!: ElementRef;

  constructor(
    private fb: FormBuilder,
    private profileService: ServProfileApi,
    private dropDownsService: ServDropdownsApi,
    private apiError: ApiErrorService,
    private ui: UiAlertService
  ) {
    this.formStudent = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(50), Validators.pattern(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)]],
      email: [null, [Validators.required, Validators.email]],
      phone: [null, [Validators.required, Validators.pattern(/^\+?[0-9]{7,15}$/)]],
      facultyId: [null, Validators.required],
      careerId: [null, Validators.required],
      semester: [null, [Validators.required, Validators.min(1), Validators.max(10)]],
      modality: [null, Validators.required],
      schedule: [null, Validators.required],
      photoUrl: ['']
    });
  }

  ngOnInit() {
    this.loadDropdowns();
  }

  ngAfterViewInit() {
    this.modalRef = new bootstrap.Modal(this.modalElement.nativeElement);
  }

  loadDropdowns() {
    this.dropDownsService.getFacultiesWithCareers().subscribe({
      next: facs => {
        this.faculties = facs;
        this.allCareers = facs.flatMap(f =>
          (f.careers ?? []).map(c => ({ ...c, facultyId: f.id }))
        );
        this.loadProfile();
      },
      error: err => this.apiError.handle(err, 'cargar facultades y carreras')
    });
  }

  loadProfile() {
    this.profileService.getMyStudentProfile().subscribe({
      next: st => {
        this.student = st;
        this.photoPreview = st.photoUrl || null;

        this.formStudent.patchValue({
          name: st.name,
          email: st.email,
          phone: st.phone,
          facultyId: st.facultyId,
          careerId: st.careerId,
          semester: st.semester,
          modality: st.modality,
          schedule: st.schedule,
          photoUrl: st.photoUrl
        });

        this.careers = this.allCareers.filter(
          c => c.facultyId === st.facultyId
        );
      },
      error: err => this.apiError.handle(err, 'cargar perfil de estudiante')
    });
  }

  openEditProfile() {
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

    const payload = {
      name: this.formStudent.value.name,
      email: this.formStudent.value.email,
      phone: this.formStudent.value.phone,
      facultyId: this.formStudent.value.facultyId,
      careerId: this.formStudent.value.careerId,
      semester: this.formStudent.value.semester,
      modality: this.formStudent.value.modality,
      schedule: this.formStudent.value.schedule,
      photoUrl: this.formStudent.value.photoUrl
    };

    this.ui
      .confirm('¿Deseas actualizar tu perfil?', 'Se guardarán tus cambios.')
      .then(result => {
        if (!result.isConfirmed) return;

        this.profileService.updateMyStudentProfile(payload).subscribe({
          next: () => {
            this.loadProfile();
            this.ui.success('¡Perfil actualizado!');
            this.modalRef.hide();
          },
          error: err =>
            this.apiError.handle(err, 'actualizar perfil de estudiante')
        });
      });
  }

}
