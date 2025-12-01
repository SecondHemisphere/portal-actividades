import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Rating } from '../models/Rating';
import { map, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ServRatingsJson {

  private ratingsUrl = "http://localhost:3000/ratings";

  constructor(private httpclient: HttpClient) {}

  // get
  getRatings(): Observable<Rating[]> {
    return this.httpclient.get<Rating[]>(this.ratingsUrl);
  }

  getRatingById(id: number): Observable<Rating> {
    return this.httpclient.get<Rating>(`${this.ratingsUrl}/${id}`);
  }

  // search
  searchRatings(param: string): Observable<Rating[]> {
    return this.httpclient.get<Rating[]>(this.ratingsUrl)
      .pipe(map(ratings =>
        ratings.filter(r =>
          r.comment?.toLowerCase().includes(param.toLowerCase())
        )
      ));
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
