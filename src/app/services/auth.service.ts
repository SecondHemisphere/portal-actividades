import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { jwtDecode } from 'jwt-decode';
import { BehaviorSubject } from 'rxjs';
import { environment } from '../environments/environment';
import { User } from '../models/User';
import { Student } from '../models/Student';
import { Organizer } from '../models/Organizer';

@Injectable({
  providedIn: 'root',
})
export class AuthService {

  private apiUrl = `${environment.apiUrl}/Auth`;

  private tokenKey = 'token';

  private loggedIn$ = new BehaviorSubject<boolean>(this.isLoggedIn());
  public loggedInObs$ = this.loggedIn$.asObservable();

  private currentUser$ = new BehaviorSubject<User | null>(null);
  public currentUserObs$ = this.currentUser$.asObservable();

  constructor(private http: HttpClient, private router: Router) {}

  login(email: string, password: string) {
    return this.http.post<{ token: string }>(`${this.apiUrl}/login`, { email, password });
  }

  registerStudent(studentData: any) {
    return this.http.post(`${this.apiUrl}/register/student`, studentData);
  }

  registerOrganizer(organizerData: any) {
    return this.http.post(`${this.apiUrl}/register/organizer`, organizerData);
  }

  saveToken(token: string): void {
    localStorage.setItem(this.tokenKey, token);
    this.loggedIn$.next(true);
  }
  
  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }
  
  logout(): void {
    localStorage.removeItem(this.tokenKey);
    this.loggedIn$.next(false);
    this.router.navigate(['/login']);
  }
  
  isLoggedIn(): boolean {
    return !!this.getToken();
  }
  
  getUserRole(): string | null {
    const token = this.getToken();
    if (!token) return null;
    const decoded: any = jwtDecode(token);
    return decoded['role'] || null;
  }
  
  getUsername(): string | null {
    const token = this.getToken();
    if (!token) return null;
    const decoded: any = jwtDecode(token);
    return decoded['username'] || null;
  }

  getUserId(): string | null {
    const token = this.getToken();
    if (!token) return null;
    const decoded: any = jwtDecode(token);
    return decoded['id'] || null;
  }

  updateCurrentUser(user: User) {
    this.currentUser$.next(user);
  }

  setCurrentUserFromToken() {
    const token = this.getToken();
    if (!token) return;

    const decoded: any = jwtDecode(token);

    this.currentUser$.next({
      id: decoded.id,
      name: decoded.username,
      email: decoded.email,
      role: decoded.role
    } as User);
  }

}
 