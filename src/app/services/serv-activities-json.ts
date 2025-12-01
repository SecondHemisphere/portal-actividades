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

  getActivityById(id: number): Observable<Activity> {
    return this.httpclient.get<Activity>(`${this.activitiesUrl}/${id}`);
  }

  getActiveActivities(): Observable<Activity[]> {
    return this.httpclient.get<Activity[]>(this.activitiesUrl)
      .pipe(map(activities => activities.filter(a => a.active === true)));
  }

  // search
  searchActivities(param: string): Observable<Activity[]> {
    return this.httpclient.get<Activity[]>(this.activitiesUrl)
      .pipe(map(activities =>
        activities.filter(a => a.title.toLowerCase().includes(param.toLowerCase()))
      ));
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
