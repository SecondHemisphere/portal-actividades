import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ServUsersJson } from '../serv-users-json';
import { User } from '../../models/User';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private currentUserSubject = new BehaviorSubject<User | null>(null);

  constructor(private usersService: ServUsersJson) {}

  login(email: string): Observable<User> {
    return this.usersService.searchUsers({ email }).pipe(
      map(users => {
        if (users.length > 0) {
          const user = users[0];
          this.currentUserSubject.next(user);
          return user;
        } else {
          throw new Error('Usuario no encontrado');
        }
      })
    );
  }

  logout() {
    this.currentUserSubject.next(null);
  }

  getCurrentUser(): Observable<User | null> {
    return this.currentUserSubject.asObservable();
  }

  getCurrentUserValue(): User | null {
    return this.currentUserSubject.value;
  }

  isLoggedIn(): boolean {
    return this.currentUserSubject.value !== null;
  }
}
