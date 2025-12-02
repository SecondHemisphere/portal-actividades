import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Enrollment } from '../models/Enrollment';
import { map, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ServEnrollmentsJson {

  private enrollmentsUrl = "http://localhost:3000/enrollments";

  constructor(private httpclient: HttpClient) {}

  // get
  getEnrollments(): Observable<Enrollment[]> {
    return this.httpclient.get<Enrollment[]>(this.enrollmentsUrl);
  }

  getEnrollmentById(id: number): Observable<Enrollment> {
    return this.httpclient.get<Enrollment>(`${this.enrollmentsUrl}/${id}`);
  }

  //search
  searchEnrollments(filters: any): Observable<Enrollment[]> {
    return this.httpclient.get<Enrollment[]>(this.enrollmentsUrl).pipe(
      map(enrollments =>
        enrollments.filter(e => {
          let ok = true;
          // Filtro por actividad
          if (filters.activityId) {
            ok = ok && e.activityId === Number(filters.activityId);
          }
          // Filtro por estudiante
          if (filters.studentId) {
            ok = ok && e.studentId === Number(filters.studentId);
          }
          // Filtro por fecha
          if (filters.date && filters.date.trim() !== '') {
            ok = ok && e.date.toLowerCase()
              .includes(filters.date.toLowerCase());
          }
          // Filtro por estado
          if (filters.status && filters.status.trim() !== '') {
            ok = ok && e.status.toLowerCase()
              .includes(filters.status.toLowerCase());
          }
          return ok;
        })
      )
    );
  }

  // create (post)
  create(enrollment: Enrollment): Observable<Enrollment> {
    return this.httpclient.post<Enrollment>(this.enrollmentsUrl, enrollment);
  }

  // update (put)
  update(enrollment: Enrollment): Observable<Enrollment> {
    let url = `${this.enrollmentsUrl}/${enrollment.id}`;
    return this.httpclient.put<Enrollment>(url, enrollment);
  }

  // delete (delete)
  delete(id: any): Observable<Enrollment> {
    let url = `${this.enrollmentsUrl}/${id}`;
    return this.httpclient.delete<Enrollment>(url);
  }

}
