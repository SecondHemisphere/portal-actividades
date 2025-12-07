import { Component, ElementRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ServStudentsJson } from '../../../services/serv-students-json';
import { Modality, Schedule, Student } from '../../../models/Student';
import { CommonModule } from '@angular/common';
import { ServFacultiesJson, Faculty } from '../../../services/serv-faculties-json';
import { User } from '../../../models/User';
import { AuthService } from '../../../services/auth/auth-service';

declare const bootstrap:any;

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
  careers: string[] = [];
  modalRef: any;

  modalities = Object.values(Modality);
  schedules = Object.values(Schedule);

  photoPreview: string | null = null;
  studentEdit:Student ={} as Student; //para foto

  constructor(
    private fb: FormBuilder,
    private studentService: ServStudentsJson,
    private facultiesService: ServFacultiesJson,
    private authService: AuthService,
  ) {}

  ngOnInit() {
    const user = this.authService.getCurrentUserValue();
    if (!user) return;
    this.user = user;

    this.facultiesService.getFaculties().subscribe(f => {
      this.faculties = f;

      this.studentService.getStudentById(Number(user.id)).subscribe(st => {
        this.student = st;
        this.photoPreview = st.photoUrl || null;

        this.formStudent = this.fb.group({
          name: [st.name, [Validators.required, Validators.minLength(3)]],
          email: [st.email, [Validators.required, Validators.email]],
          faculty: [st.faculty, Validators.required],
          career: [st.career, Validators.required],
          semester: [st.semester, [Validators.required, Validators.min(1), Validators.max(10)]],
          modality: [st.modality, Validators.required],
          schedule: [st.schedule, Validators.required],
          phone: [st.phone, [Validators.required, Validators.pattern(/^\+?[0-9]{7,15}$/)]],
          photoUrl: [st.photoUrl || '']
        });

        const facultyObj = this.faculties.find(x => x.faculty === st.faculty);
        this.careers = facultyObj ? facultyObj.careers : [];

        this.formStudent.get('faculty')?.valueChanges.subscribe(facName => {
          const selected = this.faculties.find(f => f.faculty === facName);
          this.careers = selected ? selected.careers : [];
          this.formStudent.get('career')?.setValue('');
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

    let updatedStudent: Student = {
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

        this.authService.setCurrentUser(updatedUser);

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
