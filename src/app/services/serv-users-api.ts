import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';
import { User } from '../models/User';

@Injectable({
  providedIn: 'root',
})
export class ServUsersApi {

  private apiUrl = `${environment.apiUrl}/users`;

  constructor(private http: HttpClient) {}

  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(this.apiUrl);
  }

  getUserById(id: number | string): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/${id}`);
  }

  create(user: User): Observable<any> {
    return this.http.post<any>(this.apiUrl, user);
  }

  update(user: User): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${user.id}`, user);
  }

  delete(id: number | string): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/deactivate/${id}`, null);
  }

  search(filters: {
    name?: string;
    email?: string;
    role?: string;
  }): Observable<User[]> {
    let params = new HttpParams();

    if (filters.name) params = params.set('name', filters.name);
    if (filters.email) params = params.set('email', filters.email);
    if (filters.role) params = params.set('role', filters.role);

    return this.http.get<User[]>(`${this.apiUrl}/search`, { params });
  }

  resetPassword(id: number): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/${id}/reset-password`, null);
  }
  
}
