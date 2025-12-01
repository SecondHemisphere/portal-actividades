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

  // search
  searchEnrollments(param: string): Observable<Enrollment[]> {
    return this.httpclient.get<Enrollment[]>(this.enrollmentsUrl)
      .pipe(map(enrollments =>
        enrollments.filter(e =>
          e.status.toLowerCase().includes(param.toLowerCase())
        )
      ));
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
