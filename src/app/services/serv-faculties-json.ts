import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';

export interface Faculty {
  faculty: string;
  careers: string[];
}

@Injectable({
  providedIn: 'root'
})
export class ServFacultiesJson {

  private facultiesUrl = 'http://localhost:3000/faculties';

  constructor(private http: HttpClient) {}

  // get
  getFaculties(): Observable<Faculty[]> {
    return this.http.get<Faculty[]>(this.facultiesUrl);
  }

  getFacultyByName(name: string): Observable<Faculty | undefined> {
    return this.getFaculties().pipe(
      map(faculties => faculties.find(f => f.faculty.toLowerCase() === name.toLowerCase()))
    );
  }
}
