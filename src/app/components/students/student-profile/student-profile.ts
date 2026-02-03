import { Component, ElementRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Career, Faculty, Modality, Schedule, Student } from '../../../models/Student';
import { CommonModule } from '@angular/common';
import { User } from '../../../models/User';
import { AuthService } from '../../../services/auth.service';
import { ServStudentsApi } from '../../../services/serv-students-api';
import { ServDropdownsApi } from '../../../services/serv-dropdowns-api';

declare const bootstrap: any;

@Component({
  selector: 'app-student-profile',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './student-profile.html',
  styleUrl: './student-profile.css'
})
export class StudentProfile {
  formStudent!: FormGroup;
  user!: User;
  student!: Student;
  faculties: Faculty[] = [];
  careers: Career[] = [];
  allCareers: Career[] = [];
  modalRef: any;

  modalities = Object.values(Modality);
  schedules = Object.values(Schedule);

  photoPreview: string | null = null;
  studentEdit: Student = {} as Student; // para foto

  constructor(
    private fb: FormBuilder,
    private studentService: ServStudentsApi,
    private dropDownsService: ServDropdownsApi,
    private authService: AuthService,
  ) {}

  ngOnInit() {
    const userId = this.authService.getUserId();
    if (!userId) return;

    this.dropDownsService.getFacultiesWithCareers().subscribe(faculties => {
      this.faculties = faculties;
      this.allCareers = faculties.flatMap(f => (f.careers ?? []).map(c => ({ ...c, facultyId: f.id })));

      this.studentService.getStudentById(Number(userId)).subscribe(st => {
        this.student = st;
        this.photoPreview = st.photoUrl || null;

        this.student.faculty = this.faculties.find(f => f.id === st.facultyId);
        this.student.career = this.allCareers.find(c => c.id === st.careerId);

        this.formStudent = this.fb.group({
          name: [st.name, [Validators.required, Validators.minLength(3)]],
          email: [st.email, [Validators.required, Validators.email]],
          faculty: [st.facultyId, Validators.required],
          career: [st.careerId, Validators.required],
          semester: [st.semester, [Validators.required, Validators.min(1), Validators.max(10)]],
          modality: [st.modality, Validators.required],
          schedule: [st.schedule, Validators.required],
          phone: [st.phone, [Validators.required, Validators.pattern(/^\+?[0-9]{7,15}$/)]],
          photoUrl: [st.photoUrl || '']
        });

        this.careers = this.allCareers.filter(c => c.facultyId === st.facultyId);

        this.formStudent.get('faculty')?.valueChanges.subscribe(facId => {
          this.careers = this.allCareers.filter(c => c.facultyId === Number(facId));
          this.formStudent.get('career')?.setValue(null);
        });
      });
    });
  }

  @ViewChild("studentModalRef") modalElement!: ElementRef;
  ngAfterViewInit() {
    this.modalRef = new bootstrap.Modal(this.modalElement.nativeElement);
  }

  openEditProfile(student: Student) {
    this.studentEdit = student;
    this.formStudent.patchValue(this.student);
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

    const updatedStudent: Student = {
      ...this.student,
      ...this.formStudent.value
    };

    this.studentService.update(updatedStudent).subscribe({
      next: () => {
        const updatedUser: User = {
          ...this.user,
          name: updatedStudent.name,
          email: updatedStudent.email,
          phone: updatedStudent.phone,
        };

        this.student = updatedStudent;
        this.user = updatedUser;

        alert("Perfil actualizado correctamente");
        this.modalRef.hide();
      },
      error: (err) => {
        alert("Ocurrió un error al actualizar el perfil.");
      }
    });
  }
}
