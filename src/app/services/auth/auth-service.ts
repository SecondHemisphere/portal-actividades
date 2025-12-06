import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ServUsersJson } from '../serv-users-json';
import { User } from '../../models/User';

const USER_KEY = 'currentUser';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private currentUserSubject: BehaviorSubject<User | null>;

  constructor(private usersService: ServUsersJson) {
    const storedUser = localStorage.getItem(USER_KEY);
    const initialUser: User | null = storedUser ? JSON.parse(storedUser) : null;
    
    this.currentUserSubject = new BehaviorSubject<User | null>(initialUser);
  }

  login(email: string): Observable<User> {
    return this.usersService.searchUsers({ email }).pipe(
      map(users => {
        if (users.length > 0) {
          const user = users[0];
          this.setCurrentUser(user);
          return user;
        } else {
          throw new Error('Usuario no encontrado');
        }
      })
    );
  }

  public setCurrentUser(user: User | null) {
    if (user) {
      localStorage.setItem(USER_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(USER_KEY);
    }
    this.currentUserSubject.next(user);
  }

  logout() {
    this.setCurrentUser(null);
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