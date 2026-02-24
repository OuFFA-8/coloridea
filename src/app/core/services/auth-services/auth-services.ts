import { HttpClient } from '@angular/common/http';
import { inject, Injectable, PLATFORM_ID } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root',
})
export class AuthServices {
  private apiUrl = `${environment.baseUrl}/api/v1/auth`;
  private platformId = inject(PLATFORM_ID);

  constructor(private http: HttpClient) {}

  // 1. POST Login
  login(credentials: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, credentials);
  }

  // 2. PATCH Update Password
  updatePassword(data: any): Observable<any> {
    return this.http.patch(`${this.apiUrl}/updatePassword`, data);
  }

  // 3. PATCH Forget Password
  forgetPassword(email: string): Observable<any> {
    return this.http.patch(`${this.apiUrl}/forget-password`, { email });
  }

  // 4. PATCH Reset Password
  resetPassword(
    token: string,
    data: { password: string; confirmPassword: string },
  ): Observable<any> {
    return this.http.patch(`${this.apiUrl}/reset-password/${token}`, data);
  }

  // ===== Helpers =====
  logout() {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  }

  getUser(): any {
    if (!isPlatformBrowser(this.platformId)) return null;
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }

  updateStoredUser(updatedUser: any) {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('user', JSON.stringify(updatedUser));
    }
  }

  getRole(): string | null {
    if (!isPlatformBrowser(this.platformId)) return null;
    const token = localStorage.getItem('token');
    if (!token) return null;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.role || null;
    } catch {
      return null;
    }
  }

  isAdmin(): boolean {
    return this.getRole() === 'admin';
  }

  isUser(): boolean {
    return this.getRole() === 'user';
  }
}
