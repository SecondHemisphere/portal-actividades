import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Rating } from '../models/Rating';
import { map, Observable, Subject } from 'rxjs';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ServRatingsJson {

  private ratingsUrl = `${environment.apiUrl}/ratings`;

  private reviewRequestedSource = new Subject<number>();

  public reviewRequested$ = this.reviewRequestedSource.asObservable();

  constructor(private httpclient: HttpClient) {}

  // get
  getRatings(): Observable<Rating[]> {
    return this.httpclient.get<Rating[]>(this.ratingsUrl);
  }

  getRatingById(id: number | string): Observable<Rating> {
    return this.httpclient.get<Rating>(`${this.ratingsUrl}/${id}`);
  }

  getRatingsByActivity(activityId: number): Observable<Rating[]> {
    return this.httpclient.get<Rating[]>(this.ratingsUrl).pipe(
      map(ratings => ratings.filter(r => r.activityId === activityId))
    );
  }

  getRatingsByStudent(studentId: number | string): Observable<Rating[]> {
    const id = Number(studentId);
    return this.httpclient.get<Rating[]>(this.ratingsUrl).pipe(
      map(ratings => ratings.filter(r => Number(r.studentId) === id))
    );
  }

  //search
  searchRatings(filters: any): Observable<Rating[]> {
    return this.httpclient.get<Rating[]>(this.ratingsUrl).pipe(
      map(ratings =>
        ratings.filter(r => {
          let ok = true;
          // Filtro por comentario
          if (filters.comment && filters.comment.trim() !== '') {
            ok = ok && r.comment!.toLowerCase()
              .includes(filters.comment.toLowerCase());
          }
          // Filtro por puntuación
          if (filters.stars) {
            ok = ok && r.stars === Number(filters.stars);
          }
          // Filtro por estudiante
          if (filters.studentId) {
            ok = ok && r.studentId == filters.studentId;
          }
          // Filtro por actividad
          if (filters.activityId) {
            ok = ok && r.activityId === filters.activityId;
          }
          // Filtro por fecha
          if (filters.date && filters.date.trim() !== '') {
            ok = ok && r.date.toLowerCase()
              .includes(filters.date.toLowerCase());
          }
          return ok;
        })
      )
    );
  }

  // create (post)
  create(rating: Rating): Observable<Rating> {
    return this.httpclient.post<Rating>(this.ratingsUrl, rating);
  }

  // update (put)
  update(rating: Rating): Observable<Rating> {
    let url = `${this.ratingsUrl}/${rating.id}`;
    return this.httpclient.put<Rating>(url, rating);
  }

  // delete (delete)
  delete(id: any): Observable<Rating> {
    let url = `${this.ratingsUrl}/${id}`;
    return this.httpclient.delete<Rating>(url);
  }

}
