import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Activity } from '../models/Activity';
import { map, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ServActivitiesJson {
  
  private activitiesUrl = "http://localhost:3000/activities";

  constructor(private httpclient: HttpClient) {}

  // get
  getActivities(): Observable<Activity[]> {
    return this.httpclient.get<Activity[]>(this.activitiesUrl);
  }

  getActivityById(id: number | string): Observable<Activity> {
    return this.httpclient.get<Activity>(`${this.activitiesUrl}/${id}`);
  }

  getActiveActivities(): Observable<Activity[]> {
    return this.httpclient.get<Activity[]>(this.activitiesUrl)
      .pipe(map(activities => activities.filter(a => a.active === true)));
  }

  getActivitiesByCategory(categoryId: number): Observable<Activity[]> {
    return this.httpclient.get<Activity[]>(this.activitiesUrl).pipe(
      map(activities => activities.filter(a => a.categoryId === categoryId))
    );
  }

  //search
  searchActivities(filters: any): Observable<Activity[]> {
    return this.httpclient.get<Activity[]>(this.activitiesUrl).pipe(
      map(activities =>
        activities.filter(a => {
          let ok = true;
          
          // Filtro por titulo
          if (filters.title && filters.title.trim() !== '') {
            ok = ok && a.title.toLowerCase()
              .includes(filters.title.toLowerCase());
          }
          // Filtro por categoria
          if (filters.categoryId) {
            ok = ok && a.categoryId == filters.categoryId;
          }
          // Filtro por organizador
          if (filters.organizerId) {
            ok = ok && a.organizerId === filters.organizerId;
          }
          // Filtro por ubicacion
          if (filters.location && filters.location.trim() !== '') {
            ok = ok && a.location.toLowerCase()
              .includes(filters.location.toLowerCase());
          }
          // Filtro por fecha
          if (filters.date && filters.date.trim() !== '') {
            ok = ok && a.date.toLowerCase()
              .includes(filters.date.toLowerCase());
          }
          return ok;
        })
      )
    );
  }

  // create (post)
  create(activity: Activity): Observable<Activity> {
    return this.httpclient.post<Activity>(this.activitiesUrl, activity);
  }
  
  // update (put)
  update(activity: Activity): Observable<Activity> {
    let url = `${this.activitiesUrl}/${activity.id}`;
    return this.httpclient.put<Activity>(url, activity);
  }

  // delete (delete)
  delete(id: any): Observable<Activity> {
    let url = `${this.activitiesUrl}/${id}`;
    return this.httpclient.delete<Activity>(url);
  }

}
