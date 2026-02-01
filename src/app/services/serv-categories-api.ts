import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';
import { Category } from '../models/Category';

@Injectable({
  providedIn: 'root',
})
export class ServCategoriesApi {

  private apiUrl = `${environment.apiUrl}/categories`;

  constructor(private http: HttpClient) {}

  getCategories(): Observable<Category[]> {
    return this.http.get<Category[]>(this.apiUrl);
  }

  getCategoryById(id: number | string): Observable<Category> {
    return this.http.get<Category>(`${this.apiUrl}/${id}`);
  }

  create(category: Category): Observable<Category> {
    return this.http.post<Category>(this.apiUrl, category);
  }

  update(category: Category): Observable<Category> {
    return this.http.put<Category>(`${this.apiUrl}/${category.id}`, category);
  }

  delete(id: number | string): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/deactivate/${id}`, null);
  }

  search(filters: {
    name?: string;
  }): Observable<any[]> {
    let params = new HttpParams();
    if (filters.name) params = params.set('name', filters.name);

    return this.http.get<any[]>(`${this.apiUrl}/search`, { params });
  }

}
