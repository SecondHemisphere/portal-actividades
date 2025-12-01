import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Category } from '../models/Category';
import { map, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ServCategoriesJson {

  private categoriesUrl = "http://localhost:3000/categories";

  constructor(private httpclient: HttpClient) {}

  // get
  getCategories(): Observable<Category[]> {
    return this.httpclient.get<Category[]>(this.categoriesUrl);
  }

  getCategoryById(id: number): Observable<Category> {
    return this.httpclient.get<Category>(`${this.categoriesUrl}/${id}`);
  }

  getActiveCategories(): Observable<Category[]> {
    return this.httpclient.get<Category[]>(this.categoriesUrl)
      .pipe(map(categories => categories.filter(c => c.active === true)));
  }

  //search
  searchCategories(filters: any): Observable<Category[]> {
    return this.httpclient.get<Category[]>(this.categoriesUrl).pipe(
      map(categories =>
        categories.filter(c => {
          let ok = true;
          // Filtro por nombre
          if (filters.name && filters.name.trim() !== '') {
            ok = ok && c.name.toLowerCase()
              .includes(filters.name.toLowerCase());
          }
          return ok;
        })
      )
    );
  }

  // create (post)
  create(category: Category): Observable<Category> {
    return this.httpclient.post<Category>(this.categoriesUrl, category);
  }

  // update (put)
  update(category: Category): Observable<Category> {
    let url = `${this.categoriesUrl}/${category.id}`;
    return this.httpclient.put<Category>(url, category);
  }

  // delete (delete)
  delete(id: any): Observable<Category> {
    let url = `${this.categoriesUrl}/${id}`;
    return this.httpclient.delete<Category>(url);
  }

}
