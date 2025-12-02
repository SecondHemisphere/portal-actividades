import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { User } from '../models/User';
import { map, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ServUsersJson {

  private usersUrl = "http://localhost:3000/users";

  constructor(private httpclient: HttpClient) {}

  // get
  getUsers(): Observable<User[]> {
    return this.httpclient.get<User[]>(this.usersUrl);
  }

  getUserById(id: number): Observable<User> {
    return this.httpclient.get<User>(`${this.usersUrl}/${id}`);
  }

  getActiveUsers(): Observable<User[]> {
    return this.httpclient.get<User[]>(this.usersUrl)
      .pipe(map(users => users.filter(u => u.active === true)));
  }

  //search
  searchUsers(filters: any): Observable<User[]> {
    return this.httpclient.get<User[]>(this.usersUrl).pipe(
      map(users =>
        users.filter(u => {
          let ok = true;
          // Filtro por nombre
          if (filters.name && filters.name.trim() !== '') {
            ok = ok && u.name.toLowerCase()
              .includes(filters.name.toLowerCase());
          }
          // Filtro por email
          if (filters.email && filters.email.trim() !== '') {
            ok = ok && u.email.toLowerCase()
              .includes(filters.email.toLowerCase());
          }
          // Filtro por rol
          if (filters.role && filters.role.trim() !== '') {
            ok = ok && u.role.toLowerCase()
              .includes(filters.role.toLowerCase());
          }
          return ok;
        })
      )
    );
  }

  // create
  create(user: User): Observable<User> {
    return this.httpclient.post<User>(this.usersUrl, user);
  }

  // update
  update(user: User): Observable<User> {
    let url = `${this.usersUrl}/${user.id}`;
    return this.httpclient.put<User>(url, user);
  }

  // delete
  delete(id: any): Observable<User> {
    let url = `${this.usersUrl}/${id}`;
    return this.httpclient.delete<User>(url);
  }

}
