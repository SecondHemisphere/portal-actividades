import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { jwtDecode } from 'jwt-decode';
import { BehaviorSubject } from 'rxjs';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AuthService {

  private apiUrl = `${environment.apiUrl}/Auth`;

  private tokenKey = 'token';

  private loggedIn$ = new BehaviorSubject<boolean>(this.isLoggedIn());
  public loggedInObs$ = this.loggedIn$.asObservable();

  constructor(private http: HttpClient, private router: Router) {}

  login(email: string, password: string) {
    return this.http.post<{ token: string }>(`${this.apiUrl}/login`, { email, password });
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
}
 