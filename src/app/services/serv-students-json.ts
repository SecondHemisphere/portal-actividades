import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Student } from '../models/Student';
import { map, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ServStudentsJson {

  private studentsUrl = "http://localhost:3000/students";

  constructor(private httpclient: HttpClient) {}

  getStudents(): Observable<Student[]> {
    return this.httpclient.get<Student[]>(this.studentsUrl);
  }

  getStudentById(id: number): Observable<Student> {
    return this.httpclient.get<Student>(`${this.studentsUrl}/${id}`);
  }

  getActiveStudents(): Observable<Student[]> {
    return this.httpclient.get<Student[]>(this.studentsUrl)
      .pipe(map(students => students.filter(s => s.active === true)));
  }

  //search
  searchStudents(filters: any): Observable<Student[]> {
    return this.httpclient.get<Student[]>(this.studentsUrl).pipe(
      map(students =>
        students.filter(s => {
          let ok = true;
          // Filtro por nombre
          if (filters.name && filters.name.trim() !== '') {
            ok = ok && s.name.toLowerCase()
              .includes(filters.name.toLowerCase());
          }
          // Filtro por facultad
          if (filters.faculty && filters.faculty.trim() !== '') {
            ok = ok && s.faculty.toLowerCase()
              .includes(filters.faculty.toLowerCase());
          }
          // Filtro por carrera
          if (filters.career && filters.career.trim() !== '') {
            ok = ok && s.career.toLowerCase()
              .includes(filters.career.toLowerCase());
          }
          // Filtro por modalidad
          if (filters.modality && filters.modality.trim() !== '') {
            ok = ok && s.modality.toLowerCase()
              .includes(filters.modality.toLowerCase());
          }
          // Filtro por jornada
          if (filters.schedule && filters.schedule.trim() !== '') {
            ok = ok && s.schedule.toLowerCase()
              .includes(filters.schedule.toLowerCase());
          }
          // Filtro por semestre
          if (filters.semester) {
            ok = ok && s.semester === Number(filters.semester);
          }
          return ok;
        })
      )
    );
  }

  create(student: Student): Observable<Student> {
    return this.httpclient.post<Student>(this.studentsUrl, student);
  }

  update(student: Student): Observable<Student> {
    let url = `${this.studentsUrl}/${student.id}`;
    return this.httpclient.put<Student>(url, student);
  }

  delete(id: any): Observable<Student> {
    let url = `${this.studentsUrl}/${id}`;
    return this.httpclient.delete<Student>(url);
  }

}
