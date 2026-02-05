import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';

export interface DashboardTotals {
  totalActivities: number;
  totalOrganizers: number;
  totalUsers: number;
  totalStudents: number;
  totalEnrollments: number;
  totalCategories: number;
  totalRatings: number;
}

export interface EnrollmentsByMonth {
  month: string;
  total: number;
}

export interface ActivitiesByCategory {
  categoryName: string;
  totalActivities: number;
}

export interface TopRatings {
  activityTitle: string;
  avgRating: number;
}

@Injectable({
  providedIn: 'root'
})
export class DashboardApiService {
  private apiUrl = `${environment.apiUrl}/dashboard`;

  constructor(private http: HttpClient) {}

  getTotals(): Observable<DashboardTotals> {
    return this.http.get<DashboardTotals>(`${this.apiUrl}/totals`);
  }

  getEnrollmentsLastMonths(): Observable<EnrollmentsByMonth[]> {
    return this.http.get<EnrollmentsByMonth[]>(`${this.apiUrl}/enrollments-last-months`);
  }

  getActivitiesByCategory(): Observable<ActivitiesByCategory[]> {
    return this.http.get<ActivitiesByCategory[]>(`${this.apiUrl}/activities-by-category`);
  }

  getTopRatings(): Observable<TopRatings[]> {
    return this.http.get<TopRatings[]>(`${this.apiUrl}/top-ratings`);
  }
}
