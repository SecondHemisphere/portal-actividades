import { Component, ElementRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { SearchFilter, SearchForm } from '../../shared/search-form/search-form';
import { DataTable, TableColumn } from '../../shared/data-table/data-table';
import { Modality, Schedule, Student } from '../../../models/Student';
import { ServStudentsJson } from '../../../services/serv-students-json';
import { ServFacultiesJson, Faculty } from '../../../services/serv-faculties-json';

declare const bootstrap:any;

@Component({
  selector: 'app-student-crud',
  imports: [ReactiveFormsModule, DataTable, SearchForm, FormsModule],
  templateUrl: './student-crud.html',
  styleUrl: './student-crud.css',
})
export class StudentCrud {
  students: Student[] = [];
  filteredStudents: Student[] = [];
  formStudent!: FormGroup;
  editingId: number | null = null;
  modalRef: any;

  faculties: Faculty[] = [];
  careers: string[] = [];

  modalities = Object.values(Modality);
  schedules = Object.values(Schedule);

  studentFilters: SearchFilter[] = [
    { type: 'text', field: 'name', label: 'Nombre' },
    { type: 'text', field: 'faculty', label: 'Facultad' },
    { type: 'text', field: 'career', label: 'Carrera' },
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
    { field: 'faculty', header: 'Facultad' },
    { field: 'career', header: 'Carrera' },
    { field: 'semester', header: 'Semestre', type: 'number' },
    { field: 'modality', header: 'Modalidad' },
    { field: 'schedule', header: 'Jornada' },
    { field: 'email', header: 'Correo' },
    { field: 'phone', header: 'Teléfono' },
    { field: 'active', header: 'Activo', type: 'boolean' }
  ];

  constructor(
    private miServicio: ServStudentsJson,
    private facultiesService: ServFacultiesJson,
    private formbuilder: FormBuilder
  ) {
    this.loadStudents();

    this.formStudent = this.formbuilder.group({
      name: ['',[Validators.required,Validators.minLength(3),Validators.maxLength(50),Validators.pattern(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)]],
      email:['',[Validators.required,Validators.email]],
      faculty: ['',Validators.required],
      career: ['',Validators.required],
      semester: [1,[Validators.required,Validators.min(1),Validators.max(10)]],
      modality: ['',Validators.required],
      schedule: ['',Validators.required],
      phone: ['',[Validators.required,Validators.pattern(/^\+?[0-9]{7,15}$/)]],
      active: [true]
    });

    this.facultiesService.getFaculties().subscribe(data => {
      this.faculties = data;
    });

    this.formStudent.get('faculty')?.valueChanges.subscribe(facName => {
      const selectedFaculty = this.faculties.find(f => f.faculty === facName);
      this.careers = selectedFaculty ? selectedFaculty.careers : [];
      this.formStudent.get('career')?.setValue('');
    });
  }

  @ViewChild("studentModalRef") modalElement!: ElementRef;
  ngAfterViewInit() {
    this.modalRef = new bootstrap.Modal(this.modalElement.nativeElement);
  }

  loadStudents() {
    this.miServicio.getStudents().subscribe((data: Student[]) => {
      this.students = data;
      this.filteredStudents = [...data];
    });
  }

  delete(student: Student) {
    const confirmado = confirm(`¿Estás seguro de eliminar el estudiante? ${student.name}`);
    if (confirmado) {
      this.miServicio.delete(student.id).subscribe(() => {
        alert("Eliminado exitosamente");
        this.loadStudents();
      });
    }
  }

  search(filters: any) {
    this.miServicio.searchStudents(filters).subscribe(
      (data: Student[]) => {
        this.filteredStudents = data;
      }
    );
  }

  openNew() {
    this.editingId = null;
    this.formStudent.reset({
      name: '',
      email: 'example@ug.edu.ec',
      faculty: '',
      career: '',
      semester: 1,
      modality: '',
      schedules: '',
      phone: '',
      active: true
    });
    this.modalRef.show();
  }

  openEdit(student: Student) {
    this.editingId = student.id ? student.id : null;
    this.formStudent.patchValue(student);
    this.modalRef.show();
  }

  save() {
    if (this.formStudent.invalid) {
      this.formStudent.markAllAsTouched();
      return;
    }

    let datos = this.formStudent.value;

    if (this.editingId) {
      let student: Student = { ...datos, id: this.editingId };
      this.miServicio.update(student).subscribe(() => {
        alert("Estudiante actualizado");
        this.modalRef.hide();
        this.loadStudents();
      });
    } else {
      let student: Student = { ...datos };
      this.miServicio.create(student).subscribe(() => {
        alert("Estudiante creado");
        this.modalRef.hide();
        this.loadStudents();
      });
    }
  }
}
