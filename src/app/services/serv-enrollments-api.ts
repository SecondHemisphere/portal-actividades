import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';
import { Enrollment } from '../models/Enrollment';

@Injectable({
  providedIn: 'root',
})
export class ServEnrollmentsApi {

  private apiUrl = `${environment.apiUrl}/enrollments`;

  constructor(private http: HttpClient) {}

  getEnrollments(): Observable<Enrollment[]> {
    return this.http.get<Enrollment[]>(this.apiUrl);
  }

  getEnrollments2(): Observable<Enrollment[]> {
    return this.http.get<Enrollment[]>(`${this.apiUrl}/Enrollments2`);
  }

  getEnrollmentById(id: number | string): Observable<Enrollment> {
    return this.http.get<Enrollment>(`${this.apiUrl}/${id}`);
  }

  getEnrollmentsByStudent(studentId: number | string): Observable<Enrollment[]> {
    return this.http.get<Enrollment[]>(`${this.apiUrl}/student/${studentId}/enrollments`);
  }

  create(enrollment: Enrollment): Observable<Enrollment> {
    return this.http.post<Enrollment>(this.apiUrl, enrollment);
  }

  update(enrollment: Enrollment): Observable<Enrollment> {
    return this.http.put<Enrollment>(`${this.apiUrl}/${enrollment.id}`, enrollment);
  }

  delete(id: number | string): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/deactivate/${id}`, null);
  }

  search(filters: {
    studentId?: number;
    activityId?: number;
    status?: string;
    fromDate?: string;
    toDate?: string;
  }): Observable<Enrollment[]> {
    let params = new HttpParams();

    if (filters.studentId != null) params = params.set('studentId', filters.studentId.toString());
    if (filters.activityId != null) params = params.set('activityId', filters.activityId.toString());
    if (filters.status) params = params.set('status', filters.status);
    if (filters.fromDate) params = params.set('fromDate', filters.fromDate);
    if (filters.toDate) params = params.set('toDate', filters.toDate);

    return this.http.get<Enrollment[]>(`${this.apiUrl}/search`, { params });
  }

}
