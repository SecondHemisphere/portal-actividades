import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';
import { Faculty } from '../models/Student';

@Injectable({
  providedIn: 'root',
})
export class ServDropdownsApi {

  private apiUrl = `${environment.apiUrl}`;

  constructor(private http: HttpClient) {}

  getFacultiesWithCareers(): Observable<Faculty[]> {
    return this.http.get<Faculty[]>(`${this.apiUrl}/faculties`);
  }
}
