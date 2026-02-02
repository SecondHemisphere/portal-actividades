import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';
import { Organizer } from '../models/Organizer';

@Injectable({
  providedIn: 'root',
})
export class ServOrganizersApi {

  private apiUrl = `${environment.apiUrl}/organizers`;

  constructor(private http: HttpClient) {}

  getOrganizers(): Observable<Organizer[]> {
    return this.http.get<Organizer[]>(this.apiUrl);
  }

  getOrganizers2(): Observable<Organizer[]> {
    return this.http.get<Organizer[]>(`${this.apiUrl}/Organizers2`);
  }

  getOrganizerById(id: number | string): Observable<Organizer> {
    return this.http.get<Organizer>(`${this.apiUrl}/${id}`);
  }

  create(organizer: Organizer): Observable<Organizer> {
    return this.http.post<Organizer>(this.apiUrl, organizer);
  }

  update(organizer: Organizer): Observable<Organizer> {
    return this.http.put<Organizer>(`${this.apiUrl}/${organizer.id}`, organizer);
  }

  delete(id: number | string): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/deactivate/${id}`, null);
  }

  search(filters: {
    name?: string;
    email?: string;
    department?: string;
    position?: string;
    shift?: string;
  }): Observable<Organizer[]> {
    let params = new HttpParams();
    if (filters.name) params = params.set('name', filters.name);
    if (filters.email) params = params.set('email', filters.email);
    if (filters.department) params = params.set('department', filters.department);
    if (filters.position) params = params.set('position', filters.position);
    if (filters.shift) params = params.set('shift', filters.shift);

    return this.http.get<Organizer[]>(`${this.apiUrl}/search`, { params });
  }
}
