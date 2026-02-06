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

  private username$ = new BehaviorSubject<string | null>(this.getUsername());
  public usernameObs$ = this.username$.asObservable();

  constructor(
    private http: HttpClient,
    private router: Router
  ) {}

  login(email: string, password: string) {
    return this.http.post<{ token: string }>(
      `${this.apiUrl}/login`,
      { email, password }
    );
  }

  saveToken(token: string): void {
    localStorage.setItem(this.tokenKey, token);
    this.loggedIn$.next(true);

    const decoded: any = jwtDecode(token);
    this.username$.next(decoded['username'] || null);
  }

  logout(): void {
    localStorage.removeItem(this.tokenKey);
    this.loggedIn$.next(false);
    this.username$.next(null);
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  getUserRole(): string | null {
    const decoded = this.decodeToken();
    return decoded?.role || null;
  }

  getUsername(): string | null {
    const decoded = this.decodeToken();
    return decoded?.username || null;
  }

  getUserId(): string | null {
    const decoded = this.decodeToken();
    return decoded?.id || null;
  }

  setUsername(name: string): void {
    this.username$.next(name);
  }

  private decodeToken(): any | null {
    const token = this.getToken();
    if (!token) return null;

    try {
      return jwtDecode(token);
    } catch {
      return null;
    }
  }

}
