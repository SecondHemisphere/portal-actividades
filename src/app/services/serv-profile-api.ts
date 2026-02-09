import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';
import { Student } from '../models/Student';
import { Organizer } from '../models/Organizer';

@Injectable({
  providedIn: 'root',
})
export class ServProfileApi {

  private apiUrl = `${environment.apiUrl}/profile`;

  constructor(private http: HttpClient) {}

  getMyStudentProfile(): Observable<Student> {
    return this.http.get<Student>(`${this.apiUrl}/student`);
  }

  updateMyStudentProfile(data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/student`, data);
  }

  getMyOrganizerProfile(): Observable<Organizer> {
    return this.http.get<Organizer>(`${this.apiUrl}/organizer`);
  }

  updateMyOrganizerProfile(data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/organizer`, data);
  }

}
