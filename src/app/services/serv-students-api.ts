import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';
import { Student, Modality, Schedule } from '../models/Student';

@Injectable({
  providedIn: 'root',
})
export class ServStudentsApi {

  private apiUrl = `${environment.apiUrl}/students`;

  constructor(private http: HttpClient) {}

  getStudents(): Observable<Student[]> {
    return this.http.get<Student[]>(this.apiUrl);
  }

  getStudentById(id: number | string): Observable<Student> {
    return this.http.get<Student>(`${this.apiUrl}/${id}`);
  }

  create(student: Student): Observable<Student> {
    return this.http.post<Student>(this.apiUrl, student);
  }

  update(student: Student): Observable<Student> {
    return this.http.put<Student>(`${this.apiUrl}/${student.id}`, student);
  }

  deactivate(id: number | string): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/deactivate/${id}`, null);
  }

  search(filters: {
    name?: string;
    facultyId?: number;
    careerId?: number;
    semester?: number;
    modality?: Modality;
    schedule?: Schedule;
  }): Observable<Student[]> {

    let params = new HttpParams();

    if (filters.name?.trim())
      params = params.set('name', filters.name);

    if (filters.facultyId != null)
      params = params.set('facultyId', filters.facultyId.toString());

    if (filters.careerId != null)
      params = params.set('careerId', filters.careerId.toString());

    if (filters.semester != null)
      params = params.set('semester', filters.semester.toString());

    if (filters.modality)
      params = params.set('modality', filters.modality);

    if (filters.schedule)
      params = params.set('schedule', filters.schedule);

    return this.http.get<Student[]>(`${this.apiUrl}/search`, { params });
  }

}
