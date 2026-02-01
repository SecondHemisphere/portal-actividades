import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';
import { Activity } from '../models/Activity';

@Injectable({
  providedIn: 'root',
})
export class ServActivitiesApi {

  private apiUrl = `${environment.apiUrl}/activities`;

  constructor(private http: HttpClient) {}

  getActivities(): Observable<Activity[]> {
    return this.http.get<Activity[]>(this.apiUrl);
  }

  getActivityById(id: number | string): Observable<Activity> {
    return this.http.get<Activity>(`${this.apiUrl}/${id}`);
  }

  getActivityPublic(id: number | string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/public/${id}`);
  }

  search(filters: {
    title?: string;
    categoryId?: number;
    organizerId?: number;
    location?: string;
    date?: string;
  }): Observable<any[]> {
    let params = new HttpParams();
    if (filters.title) params = params.set('title', filters.title);
    if (filters.categoryId) params = params.set('categoryId', filters.categoryId);
    if (filters.organizerId) params = params.set('organizerId', filters.organizerId);
    if (filters.location) params = params.set('location', filters.location);
    if (filters.date) params = params.set('date', filters.date);

    return this.http.get<any[]>(`${this.apiUrl}/search`, { params });
  }

  create(activity: Activity): Observable<Activity> {
    return this.http.post<Activity>(this.apiUrl, activity);
  }

  update(activity: Activity): Observable<Activity> {
    return this.http.put<Activity>(`${this.apiUrl}/${activity.id}`, activity);
  }

  delete(id: number | string): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/deactivate/${id}`, null);
  }

}
