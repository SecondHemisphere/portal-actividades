import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';
import { Rating } from '../models/Rating';

@Injectable({
  providedIn: 'root',
})
export class ServRatingsApi {

  private apiUrl = `${environment.apiUrl}/ratings`;

  constructor(private http: HttpClient) {}

  getRatings(): Observable<Rating[]> {
    return this.http.get<Rating[]>(this.apiUrl);
  }

  getRatings2(): Observable<Rating[]> {
    return this.http.get<Rating[]>(`${this.apiUrl}/Ratings2`);
  }

  getRatingById(id: number | string): Observable<Rating> {
    return this.http.get<Rating>(`${this.apiUrl}/${id}`);
  }

  getRatingsByStudent(studentId: number | string): Observable<Rating[]> {
    return this.http.get<Rating[]>(`${this.apiUrl}/student/${studentId}/ratings`);
  }

  getRatingsByActivity(activityId: number | string): Observable<Rating[]> {
    return this.http.get<Rating[]>(`${this.apiUrl}/activity/${activityId}/ratings`);
  }

  create(rating: Rating): Observable<Rating> {
    return this.http.post<Rating>(this.apiUrl, rating);
  }

  update(rating: Rating): Observable<Rating> {
    return this.http.put<Rating>(`${this.apiUrl}/${rating.id}`, rating);
  }

  delete(id: number | string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  search(filters: {
    activityId?: number;
    studentId?: number;
    stars?: number;
    fromDate?: string;
    toDate?: string;
  }): Observable<Rating[]> {
    let params = new HttpParams();

    if (filters.activityId != null) params = params.set('activityId', filters.activityId.toString());
    if (filters.studentId != null) params = params.set('studentId', filters.studentId.toString());
    if (filters.stars != null) params = params.set('stars', filters.stars.toString());
    if (filters.fromDate) params = params.set('fromDate', filters.fromDate);
    if (filters.toDate) params = params.set('toDate', filters.toDate);

    return this.http.get<Rating[]>(`${this.apiUrl}/search`, { params });
  }

}
