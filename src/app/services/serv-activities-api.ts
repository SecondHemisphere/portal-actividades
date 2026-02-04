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

  getActivities2(): Observable<Activity[]> {
    return this.http.get<Activity[]>(`${this.apiUrl}/Activities2`);
  }

  getActivityById(id: number | string): Observable<Activity> {
    return this.http.get<Activity>(`${this.apiUrl}/${id}`);
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

  search(filters: {
    categoryId?: number;
    organizerId?: number;
    fromDate?: string;
    toDate?: string;
    location?: string;
    title?: string;
  }): Observable<Activity[]> {
    let params = new HttpParams();

    if (filters.categoryId != null) params = params.set('categoryId', filters.categoryId.toString());
    if (filters.organizerId != null) params = params.set('organizerId', filters.organizerId.toString());
    if (filters.fromDate) params = params.set('fromDate', filters.fromDate);
    if (filters.toDate) params = params.set('toDate', filters.toDate);
    if (filters.location) params = params.set('location', filters.location);
    if (filters.title) params = params.set('title', filters.title);

    return this.http.get<Activity[]>(`${this.apiUrl}/search`, { params });
  }

}
